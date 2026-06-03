#!/usr/bin/env python3
"""
Import Source/*.xlsx into public/data/items.json

Usage:  python3 scripts/import_excel.py
Output: public/data/items.json
"""

import json
import re
import openpyxl
from datetime import datetime

# ── Swedish month names ────────────────────────────────────────────────────
SV_MON = {
    1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'maj', 6: 'jun',
    7: 'jul', 8: 'aug', 9: 'sep', 10: 'okt', 11: 'nov', 12: 'dec',
}

# ── Area slug / display-name tables ───────────────────────────────────────
AREA_SLUG = {
    'sjödalen-fullersta':  'sjodalen-fullersta',
    'sjödalen':            'sjodalen-fullersta',
    'fullersta':           'sjodalen-fullersta',
    'flemingsberg':        'flemingsberg',
    'skogås':              'skogas',
    'trångsund':           'trangsund',
    'segeltorp':           'segeltorp',
    'vårby':               'varby',
    'gladö-lissma':        'glado-lissma',
    'gladö':               'glado-lissma',
    'lissma':              'glado-lissma',
    'huddinge':            'huddinge',
    'glömsta':             'glomsta',
    'vistaberg':           'vistaberg',
    'lida':                'lida',
}

AREA_DISPLAY = {
    'sjodalen-fullersta': 'Sjödalen-Fullersta',
    'flemingsberg':       'Flemingsberg',
    'skogas':             'Skogås',
    'trangsund':          'Trångsund',
    'segeltorp':          'Segeltorp',
    'varby':              'Vårby',
    'glado-lissma':       'Gladö-Lissma',
    'huddinge':           'Huddinge',
    'glomsta':            'Glömsta',
    'vistaberg':          'Vistaberg',
    'lida':               'Lida',
}

def to_area_id(raw):
    if not raw:
        return 'huddinge'
    s = raw.strip().lower()
    if s in AREA_SLUG:
        return AREA_SLUG[s]
    # fallback: ASCII-ify
    return (s.replace('å','a').replace('ä','a').replace('ö','o')
             .replace(' ','-').replace('/','-'))

def place_to_area(place_str):
    """Rough area from a place/address string."""
    if not place_str:
        return 'huddinge'
    p = place_str.lower()
    if 'flemingsberg' in p or 'södertörn' in p or 'sh ' in p or 'alfred nobels' in p:
        return 'flemingsberg'
    if 'skogås' in p or 'storvretsvägen' in p:
        return 'skogas'
    if 'trångsund' in p:
        return 'trangsund'
    if 'vårby' in p:
        return 'varby'
    if 'solhagavägen' in p or 'myrstuguberget' in p:
        return 'vistaberg'
    if 'segeltorp' in p or 'juringe' in p:
        return 'segeltorp'
    return 'huddinge'

def coords_to_area(lat, lng):
    """Fallback: rough geo-box area assignment."""
    if lng > 18.10:
        return 'trangsund' if lat < 59.23 else 'skogas'
    if lat < 59.225 and lng < 17.97:
        return 'flemingsberg'
    if lat > 59.26 and lng < 17.95:
        return 'varby'
    if lat > 59.26:
        return 'segeltorp'
    return 'huddinge'

# ── Date helpers ──────────────────────────────────────────────────────────
def format_date_range(dates):
    if not dates:
        return 'Löpande'
    cleaned = sorted(set(
        d.date() if isinstance(d, datetime) else d for d in dates
    ))
    if len(cleaned) == 1:
        d = cleaned[0]
        return f"{d.day} {SV_MON[d.month]}"
    first, last = cleaned[0], cleaned[-1]
    if first.month == last.month:
        return f"{first.day}–{last.day} {SV_MON[first.month]}"
    return f"{first.day} {SV_MON[first.month]}–{last.day} {SV_MON[last.month]}"

def clean_time(t):
    if not t:
        return ''
    t = str(t).strip()
    # "15.30" → "15:30"
    t = re.sub(r'(\d{1,2})\.(\d{2})', r'\1:\2', t)
    # single dash to en-dash in ranges
    t = re.sub(r'(\d{2})-(\d{2})', r'\1–\2', t)
    return t

# ── Category helpers ──────────────────────────────────────────────────────
def event_cat(kategori):
    if not kategori:
        return 'event'
    k = str(kategori).lower()
    if 'musik' in k:
        return 'musik'
    return 'event'

# ── Image pools ───────────────────────────────────────────────────────────
IMG_POOL = {
    'musik': [
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
        'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    ],
    'event': [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
        'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&q=80',
        'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80',
        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80',
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    ],
    'konst': [
        'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80',
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80',
    ],
    'motes': [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    ],
}
_img_idx = {k: 0 for k in IMG_POOL}

def pick_img(cat):
    pool = IMG_POOL[cat]
    img = pool[_img_idx[cat] % len(pool)]
    _img_idx[cat] += 1
    return img

# ── Coordinate lookup ─────────────────────────────────────────────────────
# Static table for well-known Huddinge addresses / landmarks
STATIC_COORDS = {
    'sjödalsparken':                  (59.2354, 17.9813),
    'huddinge centrum':               (59.2372, 17.9820),
    'huddinge torg':                  (59.2367, 17.9811),
    'sjödalstorget':                  (59.2354, 17.9813),
    'paradistorget':                  (59.2350, 17.9809),
    'lilla sjödalstorget':            (59.2363, 17.9827),
    'kommunalvägen 26':               (59.23858, 17.98625),
    'kommunalvägen 27':               (59.23858, 17.98620),
    'kommunalvägen 28a':              (59.23882, 17.98763),
    'kommunalvägen 28':               (59.23882, 17.98763),
    'röntgenvägen 15':                (59.22336, 17.93925),
    'ebba bååts torg 20':             (59.21870, 17.94933),
    'skogåstorget':                   (59.21762, 18.15313),
    'skogåstorget 17':                (59.21762, 18.15313),
    'skogåstorget 7-9':               (59.21762, 18.15313),
    'paradistorget 16':               (59.23508, 17.98091),
    'vårby allé 16':                  (59.26074, 17.87886),
    'storvretsvägen 60':              (59.21863, 18.15361),
    'sjödalstorget 1':                (59.23540, 17.98136),
    'kyrkogårdsvägen 6':              (59.23853, 17.98632),
    'alfred nobels allé 20':          (59.21867, 17.94453),
    'alfred nobels allé':             (59.21829, 17.94188),
    'melodivägen 22':                 (59.23400, 17.97500),
    'visättravägen 13':               (59.21700, 17.95000),
    'mariatorget 7':                  (59.23570, 17.98140),
    'sördalavägen 7':                 (59.23100, 17.99200),
    'magasinet, juringe gård':        (59.27241, 17.92918),
    'juringe gård':                   (59.27241, 17.92918),
    'flemingsberg':                   (59.21936, 17.94203),
}

# Built from aktorlista at runtime
_addr_coords: dict = {}

def _norm_addr(addr: str) -> str:
    if not addr:
        return ''
    # Remove postal code "141 xx City"
    addr = re.sub(r',?\s*\d{3}\s*\d{2}\s*\w[\w\s]*$', '', addr)
    return addr.strip().lower()

def load_aktor_coord_index():
    wb = openpyxl.load_workbook('Source/aktorlista.xlsx')
    ws = wb.active
    for r in range(2, ws.max_row + 1):
        row = [ws.cell(r, c).value for c in range(1, 9)]
        forening, plats, stadsdel, kategori, adress, lat, lng, bild = row
        if not (lat and lng):
            continue
        try:
            lat_f, lng_f = float(lat), float(lng)
        except (ValueError, TypeError):
            continue
        for key in filter(None, [
            _norm_addr(adress),
            (plats or '').strip().lower(),
            (forening or '').strip().lower(),
        ]):
            if key:
                _addr_coords[key] = (lat_f, lng_f)

def lookup_coords(adress: str) -> tuple[float, float]:
    if not adress:
        return (59.2372, 17.9820)
    key = adress.strip().lower()

    # 1. Static table (exact)
    if key in STATIC_COORDS:
        return STATIC_COORDS[key]
    # 2. Static table (substring)
    for k, v in STATIC_COORDS.items():
        if k in key or key in k:
            return v
    # 3. Aktorlista index (exact)
    norm = _norm_addr(adress)
    if norm in _addr_coords:
        return _addr_coords[norm]
    # 4. Aktorlista index (substring)
    for k, v in _addr_coords.items():
        if k and len(k) > 4 and (k in norm or norm in k):
            return v
    # 5. Default: Huddinge centrum
    return (59.2372, 17.9820)

# ── Loaders ───────────────────────────────────────────────────────────────

def load_motes(id_start: int) -> list[dict]:
    """aktorlista → motes (venues / organisations with a fixed location)."""
    items = []
    wb = openpyxl.load_workbook('Source/aktorlista.xlsx')
    ws = wb.active
    iid = id_start

    for r in range(2, ws.max_row + 1):
        row = [ws.cell(r, c).value for c in range(1, 9)]
        forening, plats, stadsdel, kategori, adress, lat, lng, bild = row

        name = (plats or forening or '').strip()
        if not name or not lat or not lng:
            continue
        try:
            lat_f, lng_f = float(lat), float(lng)
        except (ValueError, TypeError):
            continue

        host = (forening or name).strip()
        kat   = (str(kategori) if kategori else '').strip()
        area  = to_area_id(stadsdel)
        addr  = (adress or '').strip()
        desc  = kat if kat else 'Kulturplats i Huddinge'

        if len(desc) > 80:
            desc = desc[:77] + '…'

        long_parts = [f'{name} är en kulturplats i {AREA_DISPLAY.get(area, area)}.']
        if kat:
            long_parts.append(f'Typ: {kat}.')
        if addr:
            long_parts.append(f'Adress: {addr}.')
        long_desc = ' '.join(long_parts)

        items.append({
            'id':       iid,
            'cat':      'motes',
            'name':     name,
            'desc':     desc,
            'longDesc': long_desc,
            'date':     'Löpande',
            'time':     'Öppet löpande',
            'loc':      name,
            'addr':     addr,
            'host':     host,
            'area':     area,
            'free':     True,
            'img':      pick_img('motes'),
            'url':      'https://www.huddinge.se',
            'lat':      lat_f,
            'lng':      lng_f,
        })
        iid += 1

    return items


def load_konst(id_start: int) -> list[dict]:
    """konstlista → konst (permanent public art with coordinates)."""
    items = []
    wb = openpyxl.load_workbook('Source/konstlista.xlsx')
    ws = wb.active
    iid = id_start

    for r in range(2, ws.max_row + 1):
        row = [ws.cell(r, c).value for c in range(1, 13)]
        check, namn, konstnär, år, plats, form, utomhus, bild, latitude, longitud, beskrivning, bild2 = row

        if not (namn and latitude and longitud):
            continue
        try:
            lat_f, lng_f = float(latitude), float(longitud)
        except (ValueError, TypeError):
            continue
        # Sanity check: must be in Huddinge area
        if not (59.0 < lat_f < 59.5 and 17.0 < lng_f < 18.5):
            continue

        name    = str(namn).strip()
        artist  = str(konstnär).strip() if konstnär else 'Okänd konstnär'
        year    = str(int(år)) if isinstance(år, (int, float)) and år and int(år) > 0 else ''
        place   = str(plats).strip() if plats else ''
        form_s  = str(form).strip() if form else ''

        desc = f'{form_s} av {artist}' if form_s else f'Konstverk av {artist}'
        if len(desc) > 80:
            desc = desc[:77] + '…'

        if beskrivning and str(beskrivning).strip():
            long_desc = str(beskrivning).strip()
            if year:
                long_desc = f'({year}) {long_desc}'
        else:
            long_desc = f'{desc}.'
            if year:
                long_desc = f'({year}) {long_desc}'
            if place:
                long_desc += f' Belägen vid {place}.'

        area = place_to_area(place) or coords_to_area(lat_f, lng_f)

        items.append({
            'id':       iid,
            'cat':      'konst',
            'name':     name,
            'desc':     desc,
            'longDesc': long_desc,
            'date':     'Permanent',
            'time':     'Dygnet runt',
            'loc':      place or 'Huddinge',
            'addr':     place or 'Huddinge',
            'host':     artist,
            'area':     area,
            'free':     True,
            'img':      pick_img('konst'),
            'url':      'https://www.huddinge.se/uppleva-och-gora/konst-och-kultur/',
            'lat':      lat_f,
            'lng':      lng_f,
        })
        iid += 1

    return items


def load_events(id_start: int) -> list[dict]:
    """eventlista → event / musik items.

    Rows with the same (org, event-name, address) are merged into a
    single item with a collapsed date range.
    """
    wb = openpyxl.load_workbook('Source/eventlista.xlsx')
    ws = wb.active

    # Group rows by (org, name, address)
    groups: dict = {}
    for r in range(2, ws.max_row + 1):
        row = [ws.cell(r, c).value for c in range(1, 14)]
        org, namn, typ, adress, koordinater, kommundel, pris, datum, tid, kategori, passar, anmalan, länk = row

        if not namn:
            continue

        key = (
            str(org   or '').strip(),
            str(namn  or '').strip(),
            str(adress or '').strip(),
        )

        if key not in groups:
            groups[key] = {
                'org':        str(org   or '').strip(),
                'name':       str(namn  or '').strip(),
                'type':       str(typ   or '').strip(),
                'addr':       str(adress or '').strip(),
                'kommundel':  str(kommundel or '').strip(),
                'dates':      [],
                'tid':        str(tid   or '').strip() if tid else '',
                'kategori':   str(kategori or '').strip(),
                'passar':     str(passar  or '').strip() if passar else '',
                'free':       pris == 0 or pris is None,
                'anmalan':    str(anmalan or '').strip() if anmalan else '',
                'url':        str(länk  or '').strip() if länk else '',
            }
        g = groups[key]
        if datum:
            g['dates'].append(datum)
        if pris == 0 or pris is None:
            g['free'] = True          # free on any day → mark free
        if länk and not g['url']:
            g['url'] = str(länk).strip()

    items = []
    iid = id_start
    for key, g in groups.items():
        cat        = event_cat(g['kategori'])
        date_str   = format_date_range(g['dates'])
        time_str   = clean_time(g['tid'])
        coords     = lookup_coords(g['addr'])

        # Area: prefer kommundel if present, else derive from address string
        kd = g['kommundel']
        area = to_area_id(kd) if (kd and kd not in ('None', '')) else place_to_area(g['addr'])

        # desc (≤ 80 chars): type · audience
        passar = g['passar'] if g['passar'] not in ('', 'None', 'ingen info finns') else ''
        desc   = g['type'] or g['kategori'] or 'Evenemang'
        if passar:
            candidate = f"{desc} · {passar}"
            desc = candidate if len(candidate) <= 80 else desc
        if len(desc) > 80:
            desc = desc[:77] + '…'

        # longDesc
        sentences = []
        typ = g['type']
        if typ:
            sentences.append(f'{g["name"]} är ett evenemang av typen {typ.lower()}')
        if passar:
            sentences.append(f'passar för {passar}')
        if g['anmalan'] not in ('', 'None', 'nej', 'ingen info finns'):
            sentences.append('anmälan krävs')
        if not g['free']:
            sentences.append('avgiftsbelagd')
        if sentences:
            long_desc = '. '.join(sentences).capitalize() + '.'
        else:
            long_desc = f'Evenemang arrangerat av {g["org"]}.'

        items.append({
            'id':       iid,
            'cat':      cat,
            'name':     g['name'],
            'desc':     desc,
            'longDesc': long_desc,
            'date':     date_str,
            'time':     time_str,
            'loc':      g['addr'],
            'addr':     g['addr'],
            'host':     g['org'],
            'area':     area,
            'free':     g['free'],
            'img':      pick_img(cat),
            'url':      g['url'] or 'https://www.huddinge.se',
            'lat':      coords[0],
            'lng':      coords[1],
        })
        iid += 1

    return items


# ── Main ──────────────────────────────────────────────────────────────────
def main():
    print('Loading aktorlista coordinate index…')
    load_aktor_coord_index()

    print('Importing aktorlista  → motes…')
    motes  = load_motes(1)

    print('Importing konstlista  → konst…')
    konst  = load_konst(1 + len(motes))

    print('Importing eventlista  → event / musik…')
    events = load_events(1 + len(motes) + len(konst))

    all_items = motes + konst + events

    # ── orgs: all unique host values ────────────────────────────────────────
    orgs = sorted({i['host'] for i in all_items if i['host']})

    # ── areas: collect all area IDs that appear ─────────────────────────────
    area_ids = sorted({i['area'] for i in all_items})
    areas = [
        {'id': aid, 'name': AREA_DISPLAY.get(aid, aid.replace('-', ' ').title())}
        for aid in area_ids
    ]

    output = {
        'orgs':  orgs,
        'areas': areas,
        'items': all_items,
    }

    out_path = 'public/data/items.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print()
    print(f'✓ Wrote {out_path}')
    print(f'  {len(motes):>4}  motes    (aktorlista)')
    print(f'  {len(konst):>4}  konst    (konstlista, with coords)')
    print(f'  {len(events):>4}  events   (eventlista, grouped)')
    print(f'  ────')
    print(f'  {len(all_items):>4}  total items')
    print(f'  {len(orgs):>4}  organisations')
    print(f'  {len(areas):>4}  areas')

    # Quick sanity checks
    missing_coords = [i for i in all_items if i['lat'] == 59.2372 and i['lng'] == 17.9820]
    if missing_coords:
        print(f'\n  ⚠  {len(missing_coords)} items fell back to Huddinge centrum coords:')
        for i in missing_coords[:10]:
            print(f'     [{i["cat"]}] {i["name"]} — addr: "{i["addr"]}"')
        if len(missing_coords) > 10:
            print(f'     … and {len(missing_coords)-10} more')

if __name__ == '__main__':
    main()
