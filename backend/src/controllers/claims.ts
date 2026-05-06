import type { Request, Response } from 'express';
import { z } from 'zod';
import { preprocessClaims } from '../services/preprocessing.js';
import { scrapeWebsite } from '../services/scraper.js';
import { extractTextFromFile } from '../services/fileExtractor.js';
import axios from 'axios';

// Zod Schema for validation
const analyzeSchema = z.object({
  topic: z.string().min(1, "Topic is required").optional(),
  claims: z.array(z.object({
    text: z.string().min(1, "Claim text is required"),
    source: z.string().optional(),
    date: z.string().optional(),
    domain: z.string().optional()
  })).optional(),
  url: z.string().url("Must be a valid URL").optional()
});

export const analyzeFile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[analyzeFile] Request received');
    if (!req.file) {
      console.log('[analyzeFile] No file in request');
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;
    console.log(`[analyzeFile] File: ${originalname}, type: ${mimetype}, size: ${buffer.length} bytes`);
    const topicToUse = req.body.topic || 'Extracted File Data';

    // 1. Extract text from file
    console.log('[analyzeFile] Extracting text...');
    const fileText = await extractTextFromFile(buffer, mimetype);
    console.log(`[analyzeFile] Extracted ${fileText.length} chars`);

    // 2. Chunk processing (naive sentence structure)
    const sentences = fileText.match(/[^.!?]+[.!?]+/g) || [fileText];
    let allChunks: any[] = [];
    let chunk = "";
    for (const s of sentences) {
      chunk += s + " ";
      if (chunk.length > 200) {
        allChunks.push({ text: chunk.trim(), source: originalname, domain: 'File Upload' });
        chunk = "";
      }
    }
    if (chunk.trim()) {
      allChunks.push({ text: chunk.trim(), source: originalname, domain: 'File Upload' });
    }

    // Keep only the top 4 longest chunks (most content-rich) to avoid flooding AI pipeline
    allChunks.sort((a, b) => b.text.length - a.text.length);
    let finalClaims = allChunks.slice(0, 4);

    if (finalClaims.length < 2) {
      finalClaims.push({ text: "Supplemental document analysis string.", source: originalname });
    }
    console.log(`[analyzeFile] Created ${allChunks.length} chunks, sending top ${finalClaims.length} to AI pipeline...`);

    // 3. Send to AI Pipeline
    const pythonServiceUrl = process.env.AI_PIPELINE_URL || 'http://127.0.0.1:8000';
    try {
      const response = await axios.post(`${pythonServiceUrl}/process-claims`, {
        topic: topicToUse,
        claims: finalClaims
      });
      console.log('[analyzeFile] AI Pipeline responded successfully');
      res.json(response.data);
    } catch (aiError: any) {
      console.error('[analyzeFile] AI Pipeline error:', aiError?.response?.data || aiError.message);
      res.status(503).json({ error: 'AI Processing service unavailable', details: aiError?.response?.data });
    }

  } catch (error: any) {
    console.error('[analyzeFile] FATAL ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message || 'Internal Server Error processing file' });
  }
};

export const analyzeClaims = async (req: Request, res: Response): Promise<void> => {

  try {
    // 1. Validation
    const validatedData = analyzeSchema.parse(req.body);

    let finalClaims: any[] = [];
    let topicToUse = validatedData.topic || 'Web Scraped Data';

    if (req.body.url) {
      // 2a. Attempt to parse website
      const websiteText = await scrapeWebsite(req.body.url);
      
      // Instead of an advanced sentence splitter right here, let's just make it standard 3-4 sentence chunks or let python handle it.
      // For now, let's break by double newlines or split into raw paragraphs. Let's do simple naive splitting by period.
      const sentences = websiteText.match(/[^.!?]+[.!?]+/g) || [websiteText];
      
      // We chunk it
      let chunk = "";
      for (const s of sentences) {
        chunk += s + " ";
        if (chunk.length > 200) {
          finalClaims.push({ text: chunk.trim(), source: req.body.url, domain: new URL(req.body.url).hostname });
          chunk = "";
        }
      }
      if (chunk.trim()) {
        finalClaims.push({ text: chunk.trim(), source: req.body.url, domain: new URL(req.body.url).hostname });
      }

      // If we don't have enough chunks, just wrap it.
      if (finalClaims.length < 2) {
          finalClaims.push({ text: "Supplemental analysis string.", source: req.body.url });
      }

    } else if (validatedData.claims && validatedData.claims.length > 0) {
      // 2b. Use Manual Data
      // Cast to expected any to skip strict optional checks
      finalClaims = preprocessClaims(validatedData.claims as any);
    } else {
      res.status(400).json({ error: 'Must provide either claims or a URL.'});
      return;
    }

    // 3. Send to AI Pipeline (Python service)
    // Note: The AI Pipeline url should be in .env, defaulting to localhost:8000 here
    const pythonServiceUrl = process.env.AI_PIPELINE_URL || 'http://127.0.0.1:8000';
    
    try {
      const response = await axios.post(`${pythonServiceUrl}/process-claims`, {
        topic: topicToUse,
        claims: finalClaims
      });
      
      res.json(response.data);
    } catch (aiError) {
      console.error('Error connecting to AI Pipeline:', aiError);
      res.status(503).json({ error: 'AI Processing service unavailable' });
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation Error', details: error.issues });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

/* ─────────────────────────────────────────────────────────────────
   compareFiles — POST /api/compare-files
───────────────────────────────────────────────────────────────── */
export const compareFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const fileA = files?.['fileA']?.[0];
    const fileB = files?.['fileB']?.[0];

    if (!fileA || !fileB) {
      res.status(400).json({ error: 'Two files are required (fileA and fileB).' });
      return;
    }

    const topic = (req.body.topic as string) || 'Document Comparison';

    console.log(`[compareFiles] FileA: ${fileA.originalname} (${fileA.buffer.length} bytes)`);
    console.log(`[compareFiles] FileB: ${fileB.originalname} (${fileB.buffer.length} bytes)`);

    // Extract text from both files
    let textA: string, textB: string;
    try {
      [textA, textB] = await Promise.all([
        extractTextFromFile(fileA.buffer, fileA.mimetype),
        extractTextFromFile(fileB.buffer, fileB.mimetype),
      ]);
      console.log(`[compareFiles] Extracted: A=${textA.length} chars, B=${textB.length} chars`);
    } catch (extErr: any) {
      console.error('[compareFiles] Text extraction failed:', extErr.message);
      res.status(422).json({ error: 'Could not extract text from one or both files. Ensure they are PDF, TXT, or CSV.' });
      return;
    }

    // Build claim chunks from a single file's text
    function chunkText(text: string, sourceName: string, domain: string) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const chunks: { text: string; source: string; domain: string }[] = [];
      let chunk = '';
      for (const s of sentences) {
        chunk += s + ' ';
        if (chunk.length > 220) {
          chunks.push({ text: chunk.trim(), source: sourceName, domain });
          chunk = '';
        }
      }
      if (chunk.trim()) chunks.push({ text: chunk.trim(), source: sourceName, domain });
      return chunks;
    }

    const chunksA = chunkText(textA, fileA.originalname, 'Document A');
    const chunksB = chunkText(textB, fileB.originalname, 'Document B');

    // ── Relevance guard: reject off-topic document pairs ──
    try {
      const relCheck = await axios.post(`${process.env.AI_PIPELINE_URL || 'http://127.0.0.1:8000'}/check-relevance`, {
        texts_a: chunksA.slice(0, 6).map(c => c.text),
        texts_b: chunksB.slice(0, 6).map(c => c.text),
      }, { timeout: 15000 });

      if (!relCheck.data.relevant) {
        res.status(422).json({
          error: 'off_topic',
          message: relCheck.data.message,
          similarity: relCheck.data.mean_score,
        });
        return;
      }
      console.log(`[compareFiles] Relevance OK — mean similarity: ${relCheck.data.mean_score}`);
    } catch (relErr: any) {
      // If relevance check itself fails, allow through and let main pipeline run
      console.warn('[compareFiles] Relevance check skipped:', relErr.message);
    }

    // Take up to 4 chunks from each to keep the AI request reasonable
    const finalClaims = [
      ...chunksA.sort((a, b) => b.text.length - a.text.length).slice(0, 4),
      ...chunksB.sort((a, b) => b.text.length - a.text.length).slice(0, 4),
    ];

    if (finalClaims.length < 2) {
      res.status(400).json({ error: 'Could not extract enough text from the uploaded files.' });
      return;
    }

    console.log(`[compareFiles] Sending ${finalClaims.length} claims to AI pipeline...`);
    const pythonServiceUrl = process.env.AI_PIPELINE_URL || 'http://127.0.0.1:8000';
    try {
      const response = await axios.post(`${pythonServiceUrl}/process-claims`, {
        topic,
        claims: finalClaims,
      }, { timeout: 120000 });
      console.log('[compareFiles] AI Pipeline responded OK');
      res.json(response.data);
    } catch (aiError: any) {
      const isDown = aiError.code === 'ECONNREFUSED' || aiError.code === 'ENOTFOUND';
      console.error('[compareFiles] AI Pipeline error:', aiError?.response?.data || aiError.message);
      res.status(503).json({
        error: isDown
          ? 'AI Pipeline is not running. Start it with: cd ai-pipeline && uvicorn main:app --reload'
          : 'AI Processing service error',
        details: aiError?.response?.data,
      });
    }
  } catch (error: any) {
    console.error('[compareFiles] FATAL:', error.message);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

/* ─────────────────────────────────────────────────────────────────
   compareUrls — POST /api/compare-urls
   Scrape 2-5 URLs in parallel, label claims by source, detect contradictions
───────────────────────────────────────────────────────────────── */
const compareUrlsSchema = z.object({
  urls: z.array(z.string().url('Each entry must be a valid URL')).min(2, 'At least 2 URLs required').max(5, 'Maximum 5 URLs'),
  topic: z.string().optional(),
});

export const compareUrls = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = compareUrlsSchema.parse(req.body);
    const { urls } = validated;
    const topic = validated.topic || 'Multi-Source Comparison';

    console.log(`[compareUrls] Received ${urls.length} URLs for topic: "${topic}"`);

    // 1. Scrape all URLs in parallel
    const scrapeResults = await Promise.allSettled(
      urls.map(async (url) => {
        console.log(`[compareUrls] Scraping: ${url}`);
        const text = await scrapeWebsite(url);
        return { url, text };
      })
    );

    // Collect successful scrapes and report failures
    const scraped: { url: string; text: string }[] = [];
    const failed: string[] = [];
    for (const result of scrapeResults) {
      if (result.status === 'fulfilled') {
        scraped.push(result.value);
      } else {
        failed.push(result.reason?.message || 'Unknown error');
      }
    }

    if (scraped.length < 2) {
      res.status(422).json({
        error: `Only ${scraped.length} URL(s) could be scraped. At least 2 are required.`,
        failed,
      });
      return;
    }

    if (failed.length) {
      console.warn(`[compareUrls] ${failed.length} URL(s) failed:`, failed);
    }

    // 2. Chunk each source's text and label by origin
    function chunkText(text: string, sourceUrl: string) {
      const hostname = new URL(sourceUrl).hostname;
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const chunks: { text: string; source: string; domain: string }[] = [];
      let chunk = '';
      for (const s of sentences) {
        chunk += s + ' ';
        if (chunk.length > 220) {
          chunks.push({ text: chunk.trim(), source: sourceUrl, domain: hostname });
          chunk = '';
        }
      }
      if (chunk.trim()) chunks.push({ text: chunk.trim(), source: sourceUrl, domain: hostname });
      return chunks;
    }

    const allChunksBySource = scraped.map(s => chunkText(s.text, s.url));

    // 3. Optional relevance guard between first two sources
    const pythonServiceUrl = process.env.AI_PIPELINE_URL || 'http://127.0.0.1:8000';
    try {
      const relCheck = await axios.post(`${pythonServiceUrl}/check-relevance`, {
        texts_a: (allChunksBySource[0] ?? []).slice(0, 6).map(c => c.text),
        texts_b: (allChunksBySource[1] ?? []).slice(0, 6).map(c => c.text),
      }, { timeout: 15000 });

      if (!relCheck.data.relevant) {
        res.status(422).json({
          error: 'off_topic',
          message: relCheck.data.message,
          similarity: relCheck.data.mean_score,
        });
        return;
      }
      console.log(`[compareUrls] Relevance OK — mean similarity: ${relCheck.data.mean_score}`);
    } catch (relErr: any) {
      console.warn('[compareUrls] Relevance check skipped:', relErr.message);
    }

    // 4. Take top 4 longest chunks per source (most content-rich)
    const finalClaims = allChunksBySource.flatMap(chunks =>
      chunks.sort((a, b) => b.text.length - a.text.length).slice(0, 4)
    );

    if (finalClaims.length < 2) {
      res.status(400).json({ error: 'Could not extract enough text from the provided URLs.' });
      return;
    }

    console.log(`[compareUrls] Sending ${finalClaims.length} claims from ${scraped.length} sources to AI pipeline...`);

    // 5. Send to AI Pipeline
    try {
      const response = await axios.post(`${pythonServiceUrl}/process-claims`, {
        topic,
        claims: finalClaims,
      }, { timeout: 120000 });

      console.log('[compareUrls] AI Pipeline responded OK');
      res.json(response.data);
    } catch (aiError: any) {
      const isDown = aiError.code === 'ECONNREFUSED' || aiError.code === 'ENOTFOUND';
      console.error('[compareUrls] AI Pipeline error:', aiError?.response?.data || aiError.message);
      res.status(503).json({
        error: isDown
          ? 'AI Pipeline is not running. Start it with: cd ai-pipeline && uvicorn main:app --reload'
          : 'AI Processing service error',
        details: aiError?.response?.data,
      });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation Error', details: error.issues });
    } else {
      console.error('[compareUrls] FATAL:', error.message);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
