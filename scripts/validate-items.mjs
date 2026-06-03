#!/usr/bin/env node
/*
  validate-items.mjs
  Simple validator for public/data/items.json
  Usage: node scripts/validate-items.mjs [--file path/to/items.json]
         node scripts/validate-items.mjs --help
*/

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const COLORS = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
};

const ALLOWED_CATS = new Set(['event', 'konst', 'motes', 'musik']);

// Geographic bounds for Huddinge — must match BOUNDS in src/js/app.js
const LAT_MIN = 59.08, LAT_MAX = 59.34;
const LNG_MIN = 17.73, LNG_MAX = 18.24;

// CSP img-src whitelists only these hosts — enforce here so prod can't 404 silently
const ALLOWED_IMG_HOSTS = new Set(['images.unsplash.com']);

// Reject HTML metacharacters in user-text fields (defense in depth for client esc())
const HTML_FORBIDDEN_RE = /[<>]/;

function color(text, col) {
  return col ? `${col}${text}${COLORS.reset}` : text;
}

function usage() {
  console.log(`Usage: node scripts/validate-items.mjs [--file <path>]

Validates public/data/items.json for structure and field constraints.

Options:
  --file, -f   Path to items.json (defaults to public/data/items.json)
  --help, -h   Show this help
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  const fileArgIndex = args.findIndex(a => a === '--file' || a === '-f');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '..');

  const defaultPath = path.join(projectRoot, 'public', 'data', 'items.json');
  const itemsPath = fileArgIndex >= 0 && args[fileArgIndex + 1]
    ? path.resolve(process.cwd(), args[fileArgIndex + 1])
    : defaultPath;

  let raw;
  try {
    raw = await fs.readFile(itemsPath, 'utf8');
  } catch (err) {
    console.error(color(`Error: cannot read file ${itemsPath}: ${err.message}`, COLORS.red));
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(color(`Error: invalid JSON in ${itemsPath}: ${err.message}`, COLORS.red));
    process.exit(1);
  }

  const topErrors = [];
  const topWarnings = [];

  // Validate orgs
  if (!Array.isArray(data.orgs)) {
    topErrors.push('orgs must be an array of strings');
  } else {
    for (let i = 0; i < data.orgs.length; i++) {
      const o = data.orgs[i];
      if (typeof o !== 'string' || !o.trim()) {
        topErrors.push(`orgs[${i}] must be a non-empty string`);
      }
    }
  }

  // Validate areas
  if (!Array.isArray(data.areas)) {
    topErrors.push('areas must be an array of {id,name} objects');
  } else {
    for (let i = 0; i < data.areas.length; i++) {
      const a = data.areas[i];
      if (typeof a !== 'object' || a === null) {
        topErrors.push(`areas[${i}] must be an object with id and name`);
        continue;
      }
      if (typeof a.id !== 'string' || !a.id.trim()) topErrors.push(`areas[${i}].id must be a non-empty string`);
      if (typeof a.name !== 'string' || !a.name.trim()) topErrors.push(`areas[${i}].name must be a non-empty string`);
    }
  }

  // Validate items array
  if (!Array.isArray(data.items)) {
    topErrors.push('items must be an array');
  }

  // Print top-level errors and exit if fatal
  if (topErrors.length > 0) {
    console.error(color('Top-level validation errors:', COLORS.red));
    for (const e of topErrors) {
      console.error(color(`  - ${e}`, COLORS.red));
    }
    process.exit(1);
  }

  const orgSet = new Set(data.orgs);
  const areaIdSet = new Set(data.areas.map(a => a.id));

  const items = data.items || [];
  const total = items.length;

  // detect duplicate ids (warning)
  const idCounts = new Map();
  for (const it of items) {
    const id = it && typeof it.id !== 'undefined' ? it.id : null;
    if (id !== null) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }

  let failCount = 0;
  let passCount = 0;
  let warningCount = 0;

  const errorsPrinted = [];
  const warningsPrinted = [];

  function printItemError(idLabel, field, message) {
    const line = `[${idLabel}] ${field}: ${message}`;
    console.error(color(line, COLORS.red));
    errorsPrinted.push(line);
  }

  function printItemWarning(idLabel, field, message) {
    const line = `[${idLabel}] ${field}: ${message}`;
    console.warn(color(line, COLORS.yellow));
    warningsPrinted.push(line);
  }

  for (const item of items) {
    const idLabel = typeof item.id !== 'undefined' ? item.id : 'no-id';
    const itemErrors = [];
    const itemWarnings = [];

    // id: must be integer number
    if (!Number.isInteger(item.id)) {
      itemErrors.push({ field: 'id', msg: 'must be an integer number' });
    }

    // cat
    if (typeof item.cat !== 'string' || !ALLOWED_CATS.has(item.cat)) {
      itemErrors.push({ field: 'cat', msg: `must be one of: ${Array.from(ALLOWED_CATS).join(', ')}` });
    }

    // required string fields
    const requiredStrings = ['name', 'desc', 'date', 'time', 'loc', 'addr', 'longDesc'];
    for (const f of requiredStrings) {
      if (typeof item[f] !== 'string' || !item[f].trim()) {
        itemErrors.push({ field: f, msg: 'must be a non-empty string' });
      }
    }

    // img & url must be https:// and parse as a real URL
    let imgUrl = null;
    if (typeof item.img !== 'string' || !item.img.startsWith('https://')) {
      itemErrors.push({ field: 'img', msg: 'must be a string starting with https://' });
    } else {
      try { imgUrl = new URL(item.img); } catch (_e) {
        itemErrors.push({ field: 'img', msg: 'must be a valid URL' });
      }
    }
    if (imgUrl && !ALLOWED_IMG_HOSTS.has(imgUrl.host)) {
      itemErrors.push({ field: 'img', msg: `host '${imgUrl.host}' is not in CSP img-src allow-list (${[...ALLOWED_IMG_HOSTS].join(', ')})` });
    }

    if (typeof item.url !== 'string' || !item.url.startsWith('https://')) {
      itemErrors.push({ field: 'url', msg: 'must be a string starting with https://' });
    } else {
      try { new URL(item.url); } catch (_e) {
        itemErrors.push({ field: 'url', msg: 'must be a valid URL' });
      }
    }

    // Reject HTML metacharacters in any user-visible text field
    for (const f of ['name', 'desc', 'loc', 'addr', 'longDesc', 'host', 'date', 'time']) {
      const v = item[f];
      if (typeof v === 'string' && HTML_FORBIDDEN_RE.test(v)) {
        itemErrors.push({ field: f, msg: `must not contain '<' or '>' characters` });
      }
    }

    // lat / lng must be inside the Huddinge map bounds
    if (typeof item.lat !== 'number' || Number.isNaN(item.lat) || item.lat < LAT_MIN || item.lat > LAT_MAX) {
      itemErrors.push({ field: 'lat', msg: `must be a number between ${LAT_MIN} and ${LAT_MAX} (Huddinge bounds)` });
    }
    if (typeof item.lng !== 'number' || Number.isNaN(item.lng) || item.lng < LNG_MIN || item.lng > LNG_MAX) {
      itemErrors.push({ field: 'lng', msg: `must be a number between ${LNG_MIN} and ${LNG_MAX} (Huddinge bounds)` });
    }

    // free boolean
    if (typeof item.free !== 'boolean') {
      itemErrors.push({ field: 'free', msg: 'must be a boolean' });
    }

    // pris: number (0+) or null/undefined
    if (item.pris !== undefined && item.pris !== null) {
      if (typeof item.pris !== 'number' || Number.isNaN(item.pris) || item.pris < 0) {
        itemErrors.push({ field: 'pris', msg: 'must be a non-negative number, null, or omitted' });
      }
    }

    // registration: boolean or null/undefined
    if (item.registration !== undefined && item.registration !== null) {
      if (typeof item.registration !== 'boolean') {
        itemErrors.push({ field: 'registration', msg: 'must be a boolean, null, or omitted' });
      }
    }

    // cta: one of the allowed enum values, null, or undefined
    if (item.cta !== undefined && item.cta !== null) {
      if (!['buy', 'apply', 'info'].includes(item.cta)) {
        itemErrors.push({ field: 'cta', msg: "must be 'buy', 'apply', 'info', null, or omitted" });
      }
    }

    // cta_url: parseable http(s) URL or null/undefined
    if (item.cta_url !== undefined && item.cta_url !== null) {
      if (typeof item.cta_url !== 'string') {
        itemErrors.push({ field: 'cta_url', msg: 'must be a string URL, null, or omitted' });
      } else {
        try {
          const u = new URL(item.cta_url);
          if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            itemErrors.push({ field: 'cta_url', msg: 'must use http or https protocol' });
          }
        } catch (_e) {
          itemErrors.push({ field: 'cta_url', msg: 'must be a parseable URL' });
        }
      }
    }

    // host exists in orgs
    if (typeof item.host !== 'string' || !orgSet.has(item.host)) {
      itemErrors.push({ field: 'host', msg: 'must be one of the top-level orgs' });
    }

    // area exists in areas by id
    if (typeof item.area !== 'string' || !areaIdSet.has(item.area)) {
      itemErrors.push({ field: 'area', msg: 'must match an area id from top-level areas' });
    }

    // duplicates — hard error: causes broken DOM ids and marker churn
    if (typeof item.id !== 'undefined' && idCounts.get(item.id) > 1) {
      itemErrors.push({ field: 'id', msg: 'duplicate id found in items array' });
    }

    // print errors / warnings
    if (itemErrors.length > 0) {
      failCount += 1;
      for (const e of itemErrors) printItemError(idLabel, e.field, e.msg);
    } else {
      passCount += 1;
    }

    if (itemWarnings.length > 0) {
      for (const w of itemWarnings) {
        printItemWarning(idLabel, w.field, w.msg);
        warningCount += 1;
      }
    }
  }

  // Summary
  console.log('');
  console.log(`Total items checked: ${total}`);

  const passText = color(`Pass: ${passCount}`, COLORS.green);
  const failText = color(`Fail: ${failCount}`, COLORS.red);
  const warnText = color(`Warnings: ${warningCount}`, COLORS.yellow);

  console.log(`${passText}  ${failText}  ${warnText}`);

  if (failCount === 0) {
    console.log(color('All items valid ✅', COLORS.green));
    process.exit(0);
  } else {
    console.error(color(`Validation failed: ${failCount} item(s) with errors.`, COLORS.red));
    process.exit(1);
  }
}

main().catch(err => {
  console.error(color(`Unexpected error: ${err.stack || err}`, COLORS.red));
  process.exit(1);
});
