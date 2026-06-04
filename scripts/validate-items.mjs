#!/usr/bin/env node
/*
  validate-items.mjs
  Validates public/data/items-combined.json (new multi-collection schema).
  Usage: node scripts/validate-items.mjs [--file path/to/items-combined.json]
         node scripts/validate-items.mjs --help
*/

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const COLORS = {
  reset: '\u001b[0m',
  red:   '\u001b[31m',
  green: '\u001b[32m',
  yellow:'\u001b[33m',
};

// Categories defined in app.js CAT_COLOR / CAT_LABEL
const KNOWN_CATS = new Set([
  'event','musik','konst','teater','samhalle','fritid',
  'spel','hantverk','film','kurs','kultur','plats',
]);

// Geographic bounds for Huddinge — must match BOUNDS in src/js/app.js
const LAT_MIN = 59.08, LAT_MAX = 59.34;
const LNG_MIN = 17.73, LNG_MAX = 18.24;

const HTML_FORBIDDEN_RE = /[<>]/;

function color(text, col) {
  return col ? `${col}${text}${COLORS.reset}` : text;
}

function usage() {
  console.log(`Usage: node scripts/validate-items.mjs [--file <path>]

Validates public/data/items-combined.json for structure and field constraints.
Schema: { events[], konst[], aktorer[], orgs[], areas[] }

Options:
  --file, -f   Path to items-combined.json (defaults to public/data/items-combined.json)
  --help, -h   Show this help
`);
}

function checkHtml(errors, idLabel, field, value) {
  if (typeof value === 'string' && HTML_FORBIDDEN_RE.test(value)) {
    errors.push({ field, msg: `must not contain '<' or '>' (XSS guard)` });
  }
}

function withinBounds(lat, lng) {
  return (
    typeof lat === 'number' && !Number.isNaN(lat) &&
    typeof lng === 'number' && !Number.isNaN(lng) &&
    lat >= LAT_MIN && lat <= LAT_MAX &&
    lng >= LNG_MIN && lng <= LNG_MAX
  );
}

function hasCoords(item) {
  return item.lat !== 0 || item.lng !== 0;
}

// ── Validators per type ────────────────────────────────────────────

function validateEvent(item, idx) {
  const errors = [], warnings = [];
  const label = item.id !== undefined ? item.id : `events[${idx}]`;

  if (!item.id) errors.push({ field: 'id', msg: 'required' });
  if (typeof item.name !== 'string' || !item.name.trim())
    errors.push({ field: 'name', msg: 'must be a non-empty string' });
  if (typeof item.cat !== 'string')
    errors.push({ field: 'cat', msg: 'required string' });
  else if (!KNOWN_CATS.has(item.cat))
    warnings.push({ field: 'cat', msg: `'${item.cat}' not in CAT_COLOR — add to app.js` });
  if (typeof item.free !== 'boolean')
    errors.push({ field: 'free', msg: 'must be a boolean' });

  for (const f of ['name','desc','date','time','loc','host']) {
    checkHtml(errors, label, f, item[f]);
  }
  if (!hasCoords(item))
    warnings.push({ field: 'lat/lng', msg: 'both 0 — item will not appear on map' });

  return { label, errors, warnings };
}

function validateKonst(item, idx) {
  const errors = [], warnings = [];
  const label = item.id !== undefined ? item.id : `konst[${idx}]`;

  if (!item.id) errors.push({ field: 'id', msg: 'required' });
  if (typeof item.name !== 'string' || !item.name.trim())
    errors.push({ field: 'name', msg: 'must be a non-empty string' });
  if (item.cat !== 'konst')
    errors.push({ field: 'cat', msg: `must be 'konst', got '${item.cat}'` });

  for (const f of ['name','artist','year','loc','desc','longDesc']) {
    checkHtml(errors, label, f, item[f]);
  }
  if (!hasCoords(item))
    warnings.push({ field: 'lat/lng', msg: 'both 0 — item will not appear on map' });
  else if (!withinBounds(item.lat, item.lng))
    warnings.push({ field: 'lat/lng', msg: `(${item.lat},${item.lng}) outside Huddinge bounds` });

  return { label, errors, warnings };
}

function validateAktor(item, idx) {
  const errors = [], warnings = [];
  const label = item.id !== undefined ? item.id : `aktorer[${idx}]`;

  if (!item.id) errors.push({ field: 'id', msg: 'required' });
  if (typeof item.name !== 'string' || !item.name.trim())
    errors.push({ field: 'name', msg: 'must be a non-empty string' });
  if (item.cat !== 'plats')
    errors.push({ field: 'cat', msg: `must be 'plats', got '${item.cat}'` });
  if (typeof item.type !== 'string')
    errors.push({ field: 'type', msg: 'required string (activity category)' });
  else if (!KNOWN_CATS.has(item.type))
    warnings.push({ field: 'type', msg: `'${item.type}' not in KNOWN_CATS` });

  for (const f of ['name','org','addr','area']) {
    checkHtml(errors, label, f, item[f]);
  }

  // Aktorer are places — coordinates strongly recommended; warn if missing
  if (!hasCoords(item))
    warnings.push({ field: 'lat/lng', msg: 'aktör has no coordinates — will not appear on map' });
  else if (!withinBounds(item.lat, item.lng))
    warnings.push({ field: 'lat/lng', msg: `(${item.lat},${item.lng}) outside Huddinge bounds` });

  return { label, errors, warnings };
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  const fileArgIndex = args.findIndex(a => a === '--file' || a === '-f');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '..');
  const defaultPath = path.join(projectRoot, 'public', 'data', 'items-combined.json');
  const dataPath = fileArgIndex >= 0 && args[fileArgIndex + 1]
    ? path.resolve(process.cwd(), args[fileArgIndex + 1])
    : defaultPath;

  let raw;
  try {
    raw = await fs.readFile(dataPath, 'utf8');
  } catch (err) {
    console.error(color(`Error: cannot read ${dataPath}: ${err.message}`, COLORS.red));
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(color(`Error: invalid JSON: ${err.message}`, COLORS.red));
    process.exit(1);
  }

  // Top-level shape
  const topErrors = [];
  if (!Array.isArray(data.events))   topErrors.push('events must be an array');
  if (!Array.isArray(data.konst))    topErrors.push('konst must be an array');
  if (!Array.isArray(data.aktorer))  topErrors.push('aktorer must be an array');
  if (!Array.isArray(data.orgs))     topErrors.push('orgs must be an array');
  if (!Array.isArray(data.areas))    topErrors.push('areas must be an array');
  if (topErrors.length > 0) {
    for (const e of topErrors) console.error(color(`  ✗ ${e}`, COLORS.red));
    process.exit(1);
  }

  let totalFail = 0, totalPass = 0, totalWarn = 0;

  function runSection(label, items, validator) {
    let sectionFail = 0, sectionPass = 0, sectionWarn = 0;
    for (let i = 0; i < items.length; i++) {
      const { label: id, errors, warnings } = validator(items[i], i);
      if (errors.length > 0) {
        sectionFail++;
        for (const e of errors)
          console.error(color(`  [${id}] ${e.field}: ${e.msg}`, COLORS.red));
      } else {
        sectionPass++;
      }
      for (const w of warnings) {
        console.warn(color(`  [${id}] ${w.field}: ${w.msg}`, COLORS.yellow));
        sectionWarn++;
      }
    }
    const passT = color(`pass:${sectionPass}`, COLORS.green);
    const failT = sectionFail > 0 ? color(`fail:${sectionFail}`, COLORS.red) : `fail:0`;
    const warnT = sectionWarn > 0 ? color(`warn:${sectionWarn}`, COLORS.yellow) : `warn:0`;
    console.log(`  ${label.padEnd(10)} ${items.length} items  ${passT}  ${failT}  ${warnT}`);
    totalFail += sectionFail; totalPass += sectionPass; totalWarn += sectionWarn;
  }

  console.log(`\nValidating ${dataPath}\n`);
  runSection('events',  data.events,  validateEvent);
  runSection('konst',   data.konst,   validateKonst);
  runSection('aktorer', data.aktorer, validateAktor);

  // orgs / areas
  const orgErrors = data.orgs.filter(o => typeof o !== 'string' || !o.trim()).length;
  const areaErrors = data.areas.filter(a => typeof a !== 'string' || !a.trim()).length;
  if (orgErrors)  console.error(color(`  orgs: ${orgErrors} invalid entries`, COLORS.red));
  if (areaErrors) console.error(color(`  areas: ${areaErrors} invalid entries`, COLORS.red));
  totalFail += orgErrors + areaErrors;

  const total = data.events.length + data.konst.length + data.aktorer.length;
  console.log(`\nTotal: ${total} items  (${data.orgs.length} orgs, ${data.areas.length} areas)`);
  console.log(`${color(`Pass: ${totalPass}`, COLORS.green)}  ${totalFail > 0 ? color(`Fail: ${totalFail}`, COLORS.red) : 'Fail: 0'}  ${totalWarn > 0 ? color(`Warn: ${totalWarn}`, COLORS.yellow) : 'Warn: 0'}`);

  if (totalFail === 0) {
    console.log(color('\nAll items valid ✅', COLORS.green));
    process.exit(0);
  } else {
    console.error(color(`\nValidation failed: ${totalFail} error(s).`, COLORS.red));
    process.exit(1);
  }
}

main().catch(err => {
  console.error(color(`Unexpected error: ${err.stack || err}`, COLORS.red));
  process.exit(1);
});
