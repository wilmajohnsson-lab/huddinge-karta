#!/usr/bin/env node
// scripts/svg-to-png.js — convert SVG assets → PNG assets
// Usage: node scripts/svg-to-png.js  (or npm run og)
//   public/og-image.svg → public/og-image.png       (OG social image, 1200×630)
//   public/favicon.svg  → public/icons/pwa-{180,192,512}.png

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

function renderPng(svgBuf, width) {
  const r = new Resvg(svgBuf, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true } });
  return r.render().asPng();
}

// ── OG image ──────────────────────────────────────────────────────
const ogSvg = readFileSync(new URL('../public/og-image.svg', import.meta.url));
const ogPng = renderPng(ogSvg, 1200);
writeFileSync(new URL('../public/og-image.png', import.meta.url), ogPng);
console.log(`✓ public/og-image.png  (${ogPng.byteLength} bytes)`);

// ── PWA app icons (white pin on teal background) ──────────────────
mkdirSync(new URL('../public/icons', import.meta.url), { recursive: true });

const faviconInner = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/fill="#068a99"/g, 'fill="white"')
  .trim();

// Scale pin to 80 % and centre inside the 32×32 viewport (= comfortable padding)
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#068a99"/>
  <g transform="translate(16,15) scale(0.8) translate(-16,-15)">
    ${faviconInner}
  </g>
</svg>`;

const iconBuf = Buffer.from(appIconSvg);
for (const size of [180, 192, 512]) {
  const png = renderPng(iconBuf, size);
  const out = `../public/icons/pwa-${size}.png`;
  writeFileSync(new URL(out, import.meta.url), png);
  console.log(`✓ public/icons/pwa-${size}.png  (${png.byteLength} bytes)`);
}
