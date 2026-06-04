import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/images/favicons');
mkdirSync(outDir, { recursive: true });

const raw = JSON.parse(readFileSync(join(__dirname, '../public/data/aktorlista_updated.json'), 'utf8'));

const orgs = raw
  .map(a => ({ name: (a['Förening'] || a['Plats'] || '').trim(), url: a['Länk'] || '' }))
  .filter(a => a.name && a.url && a.url.startsWith('http'));

console.log(`Fetching favicons for ${orgs.length} orgs...`);

for (const org of orgs) {
  try {
    const domain = new URL(org.url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const res = await fetch(faviconUrl);
    if (!res.ok) { console.log(`  SKIP ${org.name}: HTTP ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    // Skip tiny placeholder images (< 200 bytes = generic globe)
    if (buf.length < 200) { console.log(`  SKIP ${org.name}: placeholder icon`); continue; }
    const slug = org.name.toLowerCase().replace(/[^a-z0-9åäö]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const outPath = join(outDir, `${slug}.png`);
    writeFileSync(outPath, buf);
    console.log(`  OK   ${org.name} → ${slug}.png (${buf.length}b)`);
  } catch (e) {
    console.log(`  ERR  ${org.name}: ${e.message}`);
  }
}
console.log('Done.');
