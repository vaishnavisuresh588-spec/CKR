import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeWebsite(url: string): Promise<string> {
  let data: string;

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
      },
      validateStatus: (status) => status < 400,
    });
    data = response.data as string;
  } catch (error: any) {
    const msg = error?.response?.status
      ? `HTTP ${error.response.status} from ${url}`
      : `Could not reach ${url} — ${error.message}`;
    throw new Error(msg);
  }

  const $ = cheerio.load(data);

  // ── Remove all noise (universal + Wikipedia-specific) ──
  $(
    'script, style, noscript, iframe, nav, footer, header, aside, ' +
    // Wikipedia-specific noise
    '.navbox, .navbox-inner, .navbox-group, .navbox-list, ' +
    '.toc, .tocnumber, .mw-editsection, ' +
    '.infobox, .infobox-above, .infobox-data, ' +
    '.reflist, .references, .reference, ' +
    '.hatnote, .ambox, .mbox-small, ' +
    '.catlinks, .sister-box, ' +
    '#toc, #catlinks, #mw-navigation, #siteNotice, ' +
    // General
    '[aria-hidden="true"], [role="navigation"], [role="complementary"], ' +
    '.sidebar, .ad, .advertisement, .cookie-banner'
  ).remove();

  // ── Extract only meaningful paragraph text ──
  // Prefer article > p  (Wikipedia, news articles)
  const paragraphs: string[] = [];

  const contentRoot =
    $('article') ||
    $('[role="main"]') ||
    $('main') ||
    $('body');

  contentRoot.find('p').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    // Skip stubs: navigation fragments, edit notices, very short lines
    if (text.length > 60 && !/^\[edit\]/.test(text)) {
      paragraphs.push(text);
    }
  });

  // Fall back to full body text if we got nothing useful
  if (paragraphs.length === 0) {
    const fallback = $('body').text().replace(/\s+/g, ' ').trim();
    if (fallback.length < 200) {
      throw new Error(
        `Could not extract readable content from ${url}. ` +
        `This site likely requires JavaScript rendering or blocks automated access. ` +
        `Try Wikipedia, government sites, or plain article pages instead.`
      );
    }
    return fallback;
  }

  const cleanText = paragraphs.join(' ');

  if (cleanText.length < 200) {
    throw new Error(
      `Could not extract readable content from ${url}. ` +
      `This site likely requires JavaScript rendering or blocks automated access. ` +
      `Try Wikipedia, government sites, or plain article pages instead.`
    );
  }

  return cleanText;
}
