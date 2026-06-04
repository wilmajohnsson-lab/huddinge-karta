import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../public/data');

// Map category names to lowercase keys for filtering
const categoryMap = {
  'Musik': 'musik',
  'Konst': 'konst',
  'Teater': 'teater',
  'Samhälle': 'samhalle',
  'Fritid': 'fritid',
  'Spel': 'spel',
  'Hantverk': 'hantverk',
  'Film': 'film',
  'Kurs': 'kurs',
  'Kultur': 'kultur',
};

function normalizeCat(cat) {
  if (!cat) return null;
  const normalized = categoryMap[cat];
  return normalized || cat.toLowerCase();
}

// Transform eventlista
function transformEventlista() {
  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'eventlista.json'), 'utf8'));
  const [header, ...rows] = raw;
  
  return rows
    .filter(row => row.B && row.B.trim()) // Must have name
    .map((row, idx) => ({
      id: `event-${idx}`,
      cat: normalizeCat(row.J) || 'musik',
      name: row.B,
      desc: row.C || '',
      date: row.H || '',
      time: row.I || '',
      host: row.A || '',
      loc: row.D || '',
      free: row.G === '0' || row.G === 0,
      area: row.F || '',
      img: '',
      lat: 0,
      lng: 0,
      url: row.M || '',
    }));
}

// Transform konstlista
function transformKonstlista() {
  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'konstlista.json'), 'utf8'));
  const [header, ...rows] = raw;
  
  return rows
    .filter(row => row.B && row.B.trim()) // Must have name
    .map((row, idx) => ({
      id: `konst-${idx}`,
      cat: 'konst',
      name: row.B,
      artist: row.C || '',
      year: row.D || '',
      loc: row.E || '',
      desc: row.K || '',
      area: '',
      img: row.H || '',
      lat: row.I ? parseFloat(row.I) : 0,
      lng: row.J ? parseFloat(row.J) : 0,
      longDesc: row.K || '',
    }));
}

// Transform aktorlista
function transformAktorlista() {
  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'aktorlista.json'), 'utf8'));
  const [header, ...rows] = raw;
  
  return rows
    .filter(row => row.B && row.B.trim()) // Must have name (Plats)
    .map((row, idx) => ({
      id: `aktor-${idx}`,
      cat: 'plats',
      type: normalizeCat(row.D) || 'kultur',
      name: row.B,
      area: row.C || '',
      addr: row.E || '',
      img: row.H || '',
      lat: row.F ? parseFloat(row.F) : 0,
      lng: row.G ? parseFloat(row.G) : 0,
      url: '',
      org: row.A || '',
    }));
}

// Combine all data
function combineData() {
  const events = transformEventlista();
  const konst = transformKonstlista();
  const aktorer = transformAktorlista();
  
  const orgs = [
    ...new Set([
      ...events.map(e => e.host).filter(Boolean),
      ...konst.map(k => k.artist).filter(Boolean),
      ...aktorer.map(a => a.org).filter(Boolean),
    ]),
  ];

  const areas = [
    ...new Set([
      ...events.map(e => e.area).filter(Boolean),
      ...konst.map(k => k.area).filter(Boolean),
      ...aktorer.map(a => a.area).filter(Boolean),
    ]),
  ];

  return {
    events,
    konst,
    aktorer,
    orgs,
    areas,
  };
}

// Write combined data
const combined = combineData();
fs.writeFileSync(
  path.join(dataDir, 'items-combined.json'),
  JSON.stringify(combined, null, 2)
);

console.log('✓ Data transformed successfully');
console.log(`  Events: ${combined.events.length}`);
console.log(`  Konst: ${combined.konst.length}`);
console.log(`  Aktörer: ${combined.aktorer.length}`);
