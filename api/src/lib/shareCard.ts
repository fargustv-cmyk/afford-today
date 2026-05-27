// Share card render — SPEC §9. Output: 1080×1350 (Telegram-friendly portrait
// preview ratio), warm cream gradient, big serif "Можно!", item title, and
// the afford.today tagline. Nothing private (notes, feelings) ever appears.
//
// We hand-roll SVG (no satori) — the layout is fixed enough that JSX-flexbox
// is overkill, and skipping satori cuts a 5MB dep + a build-time concern.
// resvg-js does the SVG→PNG raster.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import type { Wish } from '@afford/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// After build: dist/lib/shareCard.js → ../../src/fonts/...
// TS source: src/lib/shareCard.ts → ../fonts/...
// We point at the source font dir, which we COPY into the Docker runtime image.
const FONT_FILES = [path.resolve(__dirname, '../../src/fonts/Unbounded-Bold.ttf')];

const W = 1080;
const H = 1350;

interface RenderOpts {
  belowThreshold: boolean;
}

export function buildShareCardSvg(wish: Wish, opts: RenderOpts): string {
  const title = escapeXml(truncate(wish.title, 36));
  const price =
    wish.price != null
      ? `${Math.round(wish.price).toLocaleString('ru-RU')} ${escapeXml(wish.currency)}`
      : '';
  const sub = opts.belowThreshold ? 'БЕЗ ГРИНДА · ГОРЖУСЬ' : 'ОФИЦИАЛЬНО РАЗРЕШЕНО';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="-5%" r="120%">
      <stop offset="0%" stop-color="#FFF8EC"/>
      <stop offset="55%" stop-color="#F6E3C5"/>
      <stop offset="100%" stop-color="#EFD3AC"/>
    </radialGradient>
    <linearGradient id="ink-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2B2017"/>
      <stop offset="100%" stop-color="#4A3422"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Spinning seal kept frozen for the snapshot -->
  <g transform="translate(${W / 2}, 280)">
    <circle cx="0" cy="0" r="100" fill="none" stroke="#7A6450" stroke-width="1.2" stroke-opacity="0.4"/>
    <circle cx="0" cy="0" r="78" fill="none" stroke="#7A6450" stroke-width="1" stroke-opacity="0.25"/>
    ${sealRingText(82, 'AFFORD.TODAY ✦ РАЗРЕШЕНО ✦ AFFORD.TODAY ✦ РАЗРЕШЕНО ✦')}
    <circle cx="0" cy="0" r="56" fill="#E0533A"/>
    <path d="M-25 4 L-8 22 L26 -16" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Можно! -->
  <text x="${W / 2}" y="640" text-anchor="middle" font-family="Unbounded" font-weight="700" font-size="200" fill="url(#ink-fade)">Можно!</text>

  <!-- Subtitle / mood -->
  <text x="${W / 2}" y="720" text-anchor="middle" font-family="Unbounded" font-weight="700" font-size="28" fill="#7A6450" letter-spacing="6">${sub}</text>

  <!-- Item card -->
  <g transform="translate(80, 820)">
    <rect width="${W - 160}" height="280" rx="32" fill="#FFFDF8" stroke="#7A6450" stroke-opacity="0.12" stroke-width="1"/>
    <rect x="40" y="40" width="200" height="200" rx="22" fill="#E79A33"/>
    <text x="140" y="160" text-anchor="middle" font-family="Unbounded" font-weight="700" font-size="100" fill="#fff">✦</text>
    <text x="270" y="120" font-family="Unbounded" font-weight="700" font-size="40" fill="#2B2017">${title}</text>
    ${price ? `<text x="270" y="180" font-family="Unbounded" font-weight="700" font-size="32" fill="#7A6450">${price}</text>` : ''}
  </g>

  <!-- Footer -->
  <text x="${W / 2}" y="${H - 80}" text-anchor="middle" font-family="Unbounded" font-weight="700" font-size="26" fill="#7A6450" letter-spacing="8">AFFORD.TODAY</text>
</svg>`;
}

function sealRingText(radius: number, text: string): string {
  return `
    <defs>
      <path id="seal-ring-${radius}" d="M${-radius},0 A${radius},${radius} 0 1,1 ${radius},0 A${radius},${radius} 0 1,1 ${-radius},0"/>
    </defs>
    <text font-family="Unbounded" font-weight="700" font-size="18" fill="#7A6450" letter-spacing="3">
      <textPath href="#seal-ring-${radius}" startOffset="0">${text}</textPath>
    </text>
  `;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function renderShareCardPng(wish: Wish, opts: RenderOpts): Promise<Buffer> {
  const svg = buildShareCardSvg(wish, opts);
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: 'Unbounded'
    },
    fitTo: { mode: 'width', value: W }
  });
  return Buffer.from(resvg.render().asPng());
}
