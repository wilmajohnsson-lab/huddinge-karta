// src/js/test-helpers.js
// Small pure helpers for unit tests (no leaflet/CSS imports)

export const CAT_COLOR = { event: '#bf5917', konst: '#068a99', motes: '#c0136f', musik: '#c3a523' };
export const CAT_BG = {
  event: 'rgba(209,96,23,.14)',
  konst: 'rgba(71,193,206,.14)',
  motes: 'rgba(209,66,142,.14)',
  musik: 'rgba(248,216,75,.22)',
};
export const CAT_LABEL = { event: 'Event', konst: 'Konst', motes: 'Mötesplats', musik: 'Musik' };
export const CAT_SVG_W = { event: '<svg-event/>', konst: '<svg-whiteboard/>', motes: '<svg-mappin/>', musik: '<svg-audio/>' };

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
  const isOn = selectedCat === cat,
    isDim = selectedCat !== null && selectedCat !== undefined && selectedCat !== cat;
  return `<button class="chip chip-${cat}${isOn ? ' chip-on' : ''}${isDim ? ' chip-dim' : ''}" data-cat="${cat}">${CAT_SVG_W[cat]}${CAT_LABEL[cat]}${isOn ? '<span class="chip-x">×</span>' : ''}</button>`;
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
