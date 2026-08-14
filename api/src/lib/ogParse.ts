import { parse, type HTMLElement } from 'node-html-parser';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { OgPreview } from '@afford/shared';

// Tries hard to get title / image / price from a public product page.
// Strategy: realistic browser headers → fetch → try (1) JSON-LD Product
// schema, (2) OG/Twitter meta, (3) itemprop fallback. Anti-bot pages
// will still return useless content; that's not solvable from a Node
// server without a residential proxy.

const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 4;
const MAX_BYTES = 1_500_000; // 1.5 MB — some product pages are heavy

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

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
    const fetched = await fetchPublicHtml(url, ac.signal);
    if (!fetched) return empty();
    const { response: r, finalUrl } = fetched;
    if (!r.ok) return empty();
    const ct = r.headers.get('content-type') ?? '';
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) return empty();

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
    return extract(html, finalUrl);
  } catch {
    return empty();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPublicHtml(
  initialUrl: URL,
  signal: AbortSignal
): Promise<{ response: Response; finalUrl: URL } | null> {
  let current = initialUrl;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    if (!(await isSafePublicUrl(current))) return null;

    const response = await fetch(current, {
      signal,
      redirect: 'manual',
      headers: {
        'user-agent': UA,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.7,en;q=0.6',
        'sec-ch-ua': '"Chromium";v="121", "Not A(Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'upgrade-insecure-requests': '1'
      }
    });

    if (response.status < 300 || response.status >= 400) {
      return { response, finalUrl: current };
    }

    const location = response.headers.get('location');
    if (!location || redirects === MAX_REDIRECTS) return null;
    try {
      current = new URL(location, current);
    } catch {
      return null;
    }
  }
  return null;
}

async function isSafePublicUrl(url: URL): Promise<boolean> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== '80' && url.port !== '443') return false;

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return false;
  }

  if (isIP(hostname)) return !isPrivateAddress(hostname);

  try {
    const resolved = await lookup(hostname, { all: true, verbatim: true });
    return resolved.length > 0 && resolved.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
}

function isPrivateAddress(rawAddress: string): boolean {
  const address = rawAddress.replace(/^\[|\]$/g, '').split('%')[0].toLowerCase();
  if (address.startsWith('::ffff:')) {
    return isPrivateAddress(address.slice('::ffff:'.length));
  }

  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113)
    );
  }

  if (isIP(address) === 6) {
    if (address === '::' || address === '::1') return true;
    const first = Number.parseInt(address.split(':')[0] || '0', 16);
    return (
      (first & 0xfe00) === 0xfc00 ||
      (first & 0xffc0) === 0xfe80 ||
      (first & 0xff00) === 0xff00 ||
      address.startsWith('2001:db8:')
    );
  }

  return true;
}

function extract(html: string, baseUrl: URL): OgPreview {
  const root = parse(html);

  // 1) JSON-LD Product schema — most reliable when present
  const jsonLd = extractJsonLd(root, baseUrl);
  if (jsonLd && (jsonLd.title || jsonLd.imageUrl || jsonLd.price)) {
    return jsonLd;
  }

  // 2) OG / Twitter meta + itemprop fallback
  const ogTitle =
    getMeta(root, 'meta[property="og:title"]') ??
    getMeta(root, 'meta[name="twitter:title"]') ??
    getMeta(root, 'meta[itemprop="name"]');
  const docTitle = root.querySelector('title')?.text?.trim() || null;

  const ogImage = absolutize(
    getMeta(root, 'meta[property="og:image:secure_url"]') ??
      getMeta(root, 'meta[property="og:image"]') ??
      getMeta(root, 'meta[name="twitter:image"]') ??
      getMeta(root, 'meta[name="twitter:image:src"]') ??
      getMeta(root, 'meta[itemprop="image"]'),
    baseUrl
  );

  const priceRaw =
    getMeta(root, 'meta[property="product:price:amount"]') ??
    getMeta(root, 'meta[property="og:price:amount"]') ??
    getMeta(root, 'meta[itemprop="price"]') ??
    root.querySelector('[itemprop="price"]')?.getAttribute('content') ??
    root.querySelector('[itemprop="price"]')?.text?.trim() ??
    null;

  return {
    title: cleanText(ogTitle ?? docTitle),
    imageUrl: ogImage,
    price: parsePrice(priceRaw)
  };
}

function extractJsonLd(root: HTMLElement, baseUrl: URL): OgPreview | null {
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');
  for (const s of scripts) {
    let data: unknown;
    try {
      data = JSON.parse(s.text);
    } catch {
      continue;
    }
    for (const product of collectProducts(data)) {
      const result = productToPreview(product, baseUrl);
      if (result.title || result.imageUrl || result.price) return result;
    }
  }
  return null;
}

interface JsonProduct {
  name?: string;
  image?: string | string[] | { url?: string };
  offers?: JsonOffer | JsonOffer[];
}
interface JsonOffer {
  price?: string | number;
  lowPrice?: string | number;
  priceSpecification?: { price?: string | number };
}

function productToPreview(p: JsonProduct, baseUrl: URL): OgPreview {
  let imageUrl: string | null = null;
  if (typeof p.image === 'string') imageUrl = p.image;
  else if (Array.isArray(p.image)) imageUrl = (p.image[0] as string) ?? null;
  else if (p.image && typeof p.image === 'object' && typeof p.image.url === 'string') imageUrl = p.image.url;

  const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
  const priceRaw = offer?.price ?? offer?.lowPrice ?? offer?.priceSpecification?.price ?? null;

  return {
    title: cleanText(p.name ?? null),
    imageUrl: absolutize(imageUrl, baseUrl),
    price: parsePrice(priceRaw == null ? null : String(priceRaw))
  };
}

function collectProducts(node: unknown): JsonProduct[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(collectProducts);
  if (typeof node !== 'object') return [];
  const obj = node as Record<string, unknown>;
  const out: JsonProduct[] = [];
  const type = obj['@type'];
  if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
    out.push(obj as unknown as JsonProduct);
  }
  if (obj['@graph']) out.push(...collectProducts(obj['@graph']));
  // Sometimes the Product is wrapped — recurse defensively into any sub-objects
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') {
      // skip already-explored top-level shape to avoid infinite recursion on circular
      if (v === obj) continue;
      if ((v as Record<string, unknown>)['@type']) out.push(...collectProducts(v));
    }
  }
  return out;
}

function getMeta(root: HTMLElement, selector: string): string | null {
  const el = root.querySelector(selector);
  if (!el) return null;
  return el.getAttribute('content')?.trim() || null;
}

function absolutize(maybeUrl: string | null, base: URL): string | null {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl, base).toString();
  } catch {
    return maybeUrl;
  }
}

function cleanText(s: string | null): string | null {
  if (!s) return null;
  return s.replace(/\s+/g, ' ').trim() || null;
}

function parsePrice(raw: string | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/\s+/g, '');
  if (!cleaned) return null;
  const normalized =
    cleaned.includes('.') && cleaned.includes(',') ? cleaned.replace(/,/g, '') : cleaned.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function empty(): OgPreview {
  return { title: null, imageUrl: null, price: null };
}
