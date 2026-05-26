import { parse } from 'node-html-parser';
import type { OgPreview } from '@afford/shared';

// Light OG-tag fetcher. Strict timeouts + size cap so we don't get burned by
// hostile pages. We only pull what's needed to prefill the wish form; the user
// always sees and can edit before saving.

const TIMEOUT_MS = 6_000;
const MAX_BYTES = 1_000_000; // 1 MB

export async function fetchOgPreview(rawUrl: string): Promise<OgPreview> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return empty();
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return empty();

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: {
        // Be polite; identify and ask for human page.
        'user-agent': 'afford.today-bot/0.1 (+https://afford.today)',
        accept: 'text/html,application/xhtml+xml'
      }
    });
    if (!r.ok) return empty();
    const ct = r.headers.get('content-type') ?? '';
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) return empty();

    // Read up to MAX_BYTES; abort if larger.
    const reader = r.body?.getReader();
    if (!reader) return empty();
    let received = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        ac.abort();
        break;
      }
      chunks.push(value);
    }
    const buf = Buffer.concat(chunks);
    const html = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    return extract(html);
  } catch {
    return empty();
  } finally {
    clearTimeout(timer);
  }
}

function extract(html: string): OgPreview {
  const root = parse(html);

  const getMeta = (selector: string): string | null => {
    const el = root.querySelector(selector);
    if (!el) return null;
    return el.getAttribute('content')?.trim() || null;
  };

  const ogTitle = getMeta('meta[property="og:title"]') ?? getMeta('meta[name="twitter:title"]');
  const docTitle = root.querySelector('title')?.text?.trim() || null;
  const ogImage = getMeta('meta[property="og:image"]') ?? getMeta('meta[name="twitter:image"]');
  // Price: try og:price:amount, then itemprop="price", then content="123.45 RUB"
  const priceRaw =
    getMeta('meta[property="og:price:amount"]') ??
    getMeta('meta[property="product:price:amount"]') ??
    root.querySelector('[itemprop="price"]')?.getAttribute('content') ??
    root.querySelector('[itemprop="price"]')?.text?.trim() ??
    null;

  const price = parsePrice(priceRaw);

  return {
    title: ogTitle ?? docTitle,
    imageUrl: ogImage,
    price
  };
}

function parsePrice(raw: string | null): number | null {
  if (!raw) return null;
  // Strip everything but digits, comma, dot.
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/\s+/g, '');
  if (!cleaned) return null;
  // If both . and , present, assume , = thousands sep
  const normalized = cleaned.includes('.') && cleaned.includes(',')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function empty(): OgPreview {
  return { title: null, imageUrl: null, price: null };
}
