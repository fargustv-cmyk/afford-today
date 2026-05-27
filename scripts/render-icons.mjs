// One-shot: render favicon.svg into PNGs (Telegram BotFather, apple-touch).
// Run from repo root: node scripts/render-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('app/public/favicon.svg', 'utf8');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

for (const { name, size } of sizes) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  writeFileSync(`app/public/${name}`, r.render().asPng());
  console.log(`wrote app/public/${name} (${size}px)`);
}
