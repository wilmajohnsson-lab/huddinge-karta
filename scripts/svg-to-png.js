#!/usr/bin/env node
// scripts/svg-to-png.js — convert public/og-image.svg → public/og-image.png
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync(new URL('../public/og-image.svg', import.meta.url));
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
});
const png = resvg.render().asPng();
writeFileSync(new URL('../public/og-image.png', import.meta.url), png);
console.log(`og-image.png written (${png.byteLength} bytes)`);
