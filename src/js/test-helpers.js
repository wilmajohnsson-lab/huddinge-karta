// src/js/test-helpers.js
// Small pure helpers for unit tests (no leaflet/CSS imports)

export const CAT_COLOR = { event: '#a04612', musik: '#8a7515', konst: '#055e69', teater: '#9a0e58', samhalle: '#0066cc', fritid: '#ff6b35', spel: '#6a4c93', hantverk: '#d4a574', film: '#1a1a1a', kurs: '#2ecc71', kultur: '#e74c3c', plats: '#9a0e58' };
export const CAT_BG = {
  event: 'rgba(160,70,18,.14)',
  musik: 'rgba(138,117,21,.14)',
  konst: 'rgba(5,94,105,.14)',
  teater: 'rgba(154,14,88,.14)',
  samhalle: 'rgba(0,102,204,.14)',
  fritid: 'rgba(255,107,53,.14)',
  spel: 'rgba(106,76,147,.14)',
  hantverk: 'rgba(212,165,116,.14)',
  film: 'rgba(26,26,26,.14)',
  kurs: 'rgba(46,204,113,.14)',
  kultur: 'rgba(231,76,60,.14)',
  plats: 'rgba(154,14,88,.14)',
};
export const CAT_LABEL = { event: 'Event', musik: 'Musik', konst: 'Konst', teater: 'Teater', samhalle: 'Samhälle', fritid: 'Fritid', spel: 'Spel', hantverk: 'Hantverk', film: 'Film', kurs: 'Kurs', kultur: 'Kultur', plats: 'Platser' };
export const CAT_SVG_W = { event: '<svg-event/>', musik: '<svg-audio/>', konst: '<svg-whiteboard/>', teater: '<svg-theater/>', samhalle: '<svg-people/>', fritid: '<svg-game/>', spel: '<svg-joystick/>', hantverk: '<svg-tools/>', film: '<svg-film/>', kurs: '<svg-graduation/>', kultur: '<svg-palette/>', plats: '<svg-mappin/>' };

export function isDesktop() {
  return typeof window !== 'undefined' && window.innerWidth >= 768;
}

export function getVisible(items = [], selectedCat = null, filterState = { free: false, orgs: new Set(), areas: new Set() }) {
  return items.filter((i) => {
    if (selectedCat && i.cat !== selectedCat) return false;
    if (filterState.free && !i.free) return false;
    if (filterState.orgs && filterState.orgs.size > 0 && !filterState.orgs.has(i.host)) return false;
    if (filterState.areas && filterState.areas.size > 0 && !filterState.areas.has(i.area)) return false;
    return true;
  });
}

export function mHtml(cat, big) {
  const sz = big ? 'mpin-lg' : 'mpin-sm',
    wt = big ? 87.6 : 62.7,
    p = big ? '16px' : '8px';
  return `<div class="mpin ${sz}" style="width:${wt}px;height:${wt}px"><div class="mpin-tail"></div><div class="mpin-circle" style="background:${CAT_COLOR[cat]};padding:${p}">${CAT_SVG_W[cat]}</div></div>`;
}

export function chipHtml(cat, selectedCat = null) {
  const isOn = selectedCat === cat;
  const isDim = selectedCat !== null && selectedCat !== undefined && selectedCat !== cat;
  const col = CAT_COLOR[cat];
  const bg = isOn ? col : CAT_BG[cat];
  const textCol = isOn ? '#fff' : col;
  return `<button class="chip${isOn ? ' chip-on' : ''}${isDim ? ' chip-dim' : ''}" data-cat="${cat}" style="background:${bg};color:${textCol}" aria-pressed="${isOn}">${CAT_SVG_W[cat]}${CAT_LABEL[cat]}</button>`;
}

export function metaHtml(item) {
  const timeShort = item.time ? item.time.split('–')[0] : '';
  return `<div class="meta-tag">${item.date} · ${timeShort}</div><div class="meta-tag">${item.loc}</div>${item.free ? '<span class="free-badge">Gratis</span>' : ''}`;
}

export function eCardHtml(item) {
  return `<div class="ecard" data-item-id="${item.id}"><img class="ecard-img" src="${item.img}" alt="${item.name}"><div class="ecard-body"><div class="ecard-title">${item.name}</div><div class="ecard-desc">${item.desc}</div><div class="ecard-meta">${metaHtml(item)}</div></div></div>`;
}

export function spCardHtml(item) {
  return `<div class="sp-card" data-item-id="${item.id}"><img class="sp-card-img" src="${item.img}" alt="${item.name}"><div class="sp-card-body"><div class="sp-card-title">${item.name}</div><div class="sp-card-desc">${item.desc}</div><div class="sp-card-meta">${metaHtml(item)}</div></div></div>`;
}

export function searchItems(items = [], q = '') {
  const term = q.trim().toLowerCase();
  return term ? items.filter((i) => i.name.toLowerCase().includes(term) || i.loc.toLowerCase().includes(term)) : items;
}

export function toggleFpChip(el, set, val) {
  if (set.has(val)) {
    set.delete(val);
    el.classList.remove('on');
    return false;
  } else {
    set.add(val);
    el.classList.add('on');
    return true;
  }
}
