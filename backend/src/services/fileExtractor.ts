import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  try {
    // ── PDF ──
    if (mimetype === 'application/pdf') {
      const uint8 = new Uint8Array(buffer);
      const doc   = await getDocument({ data: uint8 }).promise;
      let fullText = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page    = await doc.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText.trim();
    }

    // ── DOCX ──
    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }

    // ── Plain text / CSV / Markdown ──
    if (
      mimetype === 'text/plain' ||
      mimetype === 'text/csv'   ||
      mimetype === 'text/markdown' ||
      mimetype === 'application/json'
    ) {
      return buffer.toString('utf-8');
    }

    throw new Error(`Unsupported file type: ${mimetype}. Supported: PDF, DOCX, TXT, CSV.`);

  } catch (error: any) {
    console.error('[fileExtractor] Error:', error.message);
    throw new Error(error.message || 'Failed to extract content from the uploaded file.');
  }
}
