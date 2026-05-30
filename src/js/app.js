// ── Imports ───────────────────────────────────────────────────────
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/styles.css';

// ── Tile provider (override via VITE_TILE_URL env var) ────────────
const TILE_URL =
  import.meta.env.VITE_TILE_URL ||
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

// ── SVGs ──────────────────────────────────────────────────────────
const S = {
  whiteboard: `<svg viewBox="0 0 24 24" fill="none"><path d="M16 18H19c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2h-7M16 18l1 3M16 18H8M8 18H5c-1.105 0-2-.895-2-2V7c0-1.105.895-2 2-2h7M8 18l-1 3M12 18v2M12 5V3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  mappin: `<svg viewBox="0 0 24 24" fill="none"><path d="M14.498 10c0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5 1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5Z" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M19 10c0 4.37-3.886 8.335-5.867 10.072a1.984 1.984 0 0 1-2.266 0C8.886 18.335 5 14.37 5 10a7 7 0 1 1 14 0Z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.998 18.5c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Zm0 0V7.488c0-.884.579-1.663 1.425-1.916l6-1.8c1.283-.385 2.575.576 2.575 1.916V15.5m0 0c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.757 10.164L3.8 16.073c.192 1.088 1.229 1.814 2.317 1.622l3.979-.701M2.757 10.164l-.347-1.97C2.218 7.106 2.944 6.069 4.032 5.877L12.896 4.314c1.088-.192 2.125.534 2.317 1.622l.173.985c.096.544-.267 1.063-.811 1.159L2.757 10.164ZM16 12v2l1.667 1.667M22 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#000" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="#000" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
};
const CHIP_SVGS = {
  event: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.757 10.164L3.8 16.073c.192 1.088 1.229 1.814 2.317 1.622l3.979-.701M2.757 10.164l-.347-1.97C2.218 7.106 2.944 6.069 4.032 5.877L12.896 4.314c1.088-.192 2.125.534 2.317 1.622l.173.985c.096.544-.267 1.063-.811 1.159L2.757 10.164ZM16 12v2l1.667 1.667M22 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  konst: `<svg viewBox="0 0 24 24" fill="none"><path d="M16 18H19c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2h-7M16 18l1 3M16 18H8M8 18H5c-1.105 0-2-.895-2-2V7c0-1.105.895-2 2-2h7M8 18l-1 3M12 18v2M12 5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  motes: `<svg viewBox="0 0 24 24" fill="none"><path d="M14.498 10c0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5 1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M19 10c0 4.37-3.886 8.335-5.867 10.072a1.984 1.984 0 0 1-2.266 0C8.886 18.335 5 14.37 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  musik: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.998 18.5c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Zm0 0V7.488c0-.884.579-1.663 1.425-1.916l6-1.8c1.283-.385 2.575.576 2.575 1.916V15.5m0 0c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
};
const CAT_COLOR = { event: '#bf5917', konst: '#068a99', motes: '#c0136f', musik: '#c3a523' };
const CAT_BG = {
  event: 'rgba(209,96,23,.14)',
  konst: 'rgba(71,193,206,.14)',
  motes: 'rgba(209,66,142,.14)',
  musik: 'rgba(248,216,75,.22)',
};
const CAT_LABEL = { event: 'Event', konst: 'Konst', motes: 'Mötesplats', musik: 'Musik' };
const CAT_SVG_W = { event: S.calendar, konst: S.whiteboard, motes: S.mappin, musik: S.audio };

// ── DATA (populated by fetch) ─────────────────────────────────────
let ITEMS = [],
  ORGS_LIST = [],
  AREAS_LIST = [];

// ── STATE ─────────────────────────────────────────────────────────
let map,
  leafMarkers = {},
  activeCardId = null,
  collapsed = false,
  detailMapInstance = null;
let selectedCat = null;
const filterState = { free: false, orgs: new Set(), areas: new Set() };

// ── HELPERS ───────────────────────────────────────────────────────
function isDesktop() {
  return window.innerWidth >= 768;
}

/**
 * Lightweight event delegation.
 * Listens on `root`, fires `handler(event, matchedEl)` when a click
 * target matches `selector` inside root.
 */
function delegate(root, selector, handler) {
  root.addEventListener('click', (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

// ── FOCUS MANAGEMENT ─────────────────────────────────────────────
let _lastFocus = null;

/** Move focus to the first focusable element inside el. */
function trapFocus(el) {
  const sel = 'button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
  const first = el.querySelector(sel);
  if (first) first.focus();
}

/** Remember the currently focused element before opening a modal. */
function saveFocus() {
  _lastFocus = document.activeElement;
}

/** Return focus to the element that was active before the modal opened. */
function restoreFocus() {
  if (_lastFocus) { _lastFocus.focus(); _lastFocus = null; }
}

// ── MAP ───────────────────────────────────────────────────────────
const BOUNDS = L.latLngBounds([59.08, 17.73], [59.34, 18.24]);

function initMap() {
  map = L.map('map', {
    center: [59.218, 17.978],
    zoom: 13,
    minZoom: 11,
    maxZoom: 16,
    maxBounds: BOUNDS,
    maxBoundsViscosity: 1,
    zoomControl: false,
  });
  L.tileLayer(TILE_URL, {
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: TILE_ATTRIBUTION,
  }).addTo(map);
  const ui = L.divIcon({
    html: `<div class="user-dot"><div class="user-dot-inner"></div></div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
  L.marker([59.2195, 17.949], { icon: ui, interactive: false }).addTo(map);
  ITEMS.forEach(addMarker);
  map.on('click', () => {
    dismissActiveCard();
  });
  window.addEventListener('resize', () => {
    map.invalidateSize();
  });
}

function mHtml(cat, big) {
  const sz = big ? 'mpin-lg' : 'mpin-sm',
    wt = big ? 87.6 : 62.7,
    p = big ? '16px' : '8px';
  return `<div class="mpin ${sz}" style="width:${wt}px;height:${wt}px"><div class="mpin-tail"></div><div class="mpin-circle" style="background:${CAT_COLOR[cat]};padding:${p}">${CAT_SVG_W[cat]}</div></div>`;
}

function addMarker(item) {
  const big = activeCardId === item.id,
    sz = big ? 87.6 : 62.7;
  const icon = L.divIcon({
    html: mHtml(item.cat, big),
    className: '',
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz],
  });
  const m = L.marker([item.lat, item.lng], { icon }).addTo(map);
  m.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    showActiveCard(item.id);
  });
  leafMarkers[item.id] = m;
}

function refreshMarker(id) {
  const m = leafMarkers[id];
  if (!m) return;
  const item = ITEMS.find((x) => x.id === id);
  const big = activeCardId === id,
    sz = big ? 87.6 : 62.7;
  m.setIcon(
    L.divIcon({
      html: mHtml(item.cat, big),
      className: '',
      iconSize: [sz, sz],
      iconAnchor: [sz / 2, sz],
    })
  );
}

// ── FILTER LOGIC ─────────────────────────────────────────────────
function getVisible() {
  return ITEMS.filter((i) => {
    if (selectedCat && i.cat !== selectedCat) return false;
    if (filterState.free && !i.free) return false;
    if (filterState.orgs.size > 0 && !filterState.orgs.has(i.host)) return false;
    if (filterState.areas.size > 0 && !filterState.areas.has(i.area)) return false;
    return true;
  });
}

function applyFilters() {
  filterState.free = document.getElementById('freeToggle').checked;
  const vis = getVisible();
  ITEMS.forEach((item) => {
    const m = leafMarkers[item.id];
    if (!m) return;
    const show = vis.some((v) => v.id === item.id);
    show ? !map.hasLayer(m) && map.addLayer(m) : map.hasLayer(m) && map.removeLayer(m);
  });
  renderContent();
  updateFilterBtnState();
}

function updateFilterBtnState() {
  const active = filterState.free || filterState.orgs.size > 0 || filterState.areas.size > 0;
  document.getElementById('mFilterBtn')?.classList.toggle('active', active);
  document.getElementById('spFilterBtn')?.classList.toggle('active', active);
}

function resetFilters() {
  filterState.free = false;
  filterState.orgs.clear();
  filterState.areas.clear();
  document.getElementById('freeToggle').checked = false;
  document.querySelectorAll('#fpOrgs .fp-chip, #fpAreas .fp-chip').forEach((c) => c.classList.remove('on'));
  applyFilters();
}

function toggleFpChip(el, set, val) {
  if (set.has(val)) {
    set.delete(val);
    el.classList.remove('on');
  } else {
    set.add(val);
    el.classList.add('on');
  }
  applyFilters();
}

function initFilterChips() {
  const orgsEl = document.getElementById('fpOrgs');
  ORGS_LIST.forEach((o) => {
    const b = document.createElement('button');
    b.className = 'fp-chip';
    b.textContent = o;
    b.addEventListener('click', () => toggleFpChip(b, filterState.orgs, o));
    orgsEl.appendChild(b);
  });
  const areasEl = document.getElementById('fpAreas');
  AREAS_LIST.forEach((a) => {
    const b = document.createElement('button');
    b.className = 'fp-chip';
    b.textContent = a.name;
    b.addEventListener('click', () => toggleFpChip(b, filterState.areas, a.id));
    areasEl.appendChild(b);
  });
}

function toggleFilter() {
  const fp = document.getElementById('filterPanel');
  fp.classList.contains('open') ? closeFilter() : openFilter();
}

function openFilter() {
  saveFocus();
  const fp = document.getElementById('filterPanel');
  const bg = document.getElementById('filterBg');
  fp.classList.add('open');
  bg.style.pointerEvents = 'auto';
  bg.style.background = 'rgba(0,0,0,.15)';
  document.getElementById('mFilterBtn').setAttribute('aria-expanded', 'true');
  document.getElementById('spFilterBtn').setAttribute('aria-expanded', 'true');
  trapFocus(fp);
}

function closeFilter() {
  document.getElementById('filterPanel').classList.remove('open');
  const bg = document.getElementById('filterBg');
  bg.style.background = 'rgba(0,0,0,0)';
  bg.style.pointerEvents = 'none';
  document.getElementById('mFilterBtn').setAttribute('aria-expanded', 'false');
  document.getElementById('spFilterBtn').setAttribute('aria-expanded', 'false');
  restoreFocus();
}

// ── CATEGORY CHIPS ────────────────────────────────────────────────
function selectCat(cat) {
  selectedCat = selectedCat === cat ? null : cat;
  renderChips();
  applyFilters();
}

function chipHtml(cat) {
  const isOn = selectedCat === cat,
    isDim = selectedCat !== null && !isOn;
  return `<button class="chip chip-${cat}${isOn ? ' chip-on' : ''}${isDim ? ' chip-dim' : ''}" data-cat="${cat}">
    ${CHIP_SVGS[cat]}${CAT_LABEL[cat]}
    ${isOn ? '<span class="chip-x">×</span>' : ''}
  </button>`;
}

function renderChips() {
  const html = ['event', 'konst', 'motes', 'musik'].map((c) => chipHtml(c)).join('');
  const m = document.getElementById('chips');
  if (m) m.innerHTML = html;
  const s = document.getElementById('spChips');
  if (s) s.innerHTML = html;
}

// ── CONTENT RENDERING ─────────────────────────────────────────────
function metaHtml(item) {
  return `<div class="meta-tag">${S.clock}${item.date} · ${item.time.split('–')[0]}</div>
          <div class="meta-tag">${S.pin}${item.loc}</div>
          ${item.free ? '<span class="free-badge">Gratis</span>' : ''}`;
}

function eCardHtml(item) {
  return `<div class="ecard" data-item-id="${item.id}">
    <img class="ecard-img" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async">
    <div class="ecard-body">
      <div class="ecard-title">${item.name}</div>
      <div class="ecard-desc">${item.desc}</div>
      <div class="ecard-meta">${metaHtml(item)}</div>
    </div>
  </div>`;
}

function spCardHtml(item) {
  return `<div class="sp-card" data-item-id="${item.id}">
    <img class="sp-card-img" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async">
    <div class="sp-card-body">
      <div>
        <div class="sp-card-title">${item.name}</div>
        <div class="sp-card-desc">${item.desc}</div>
      </div>
      <div class="sp-card-meta">${metaHtml(item)}</div>
    </div>
  </div>`;
}

function renderContent() {
  const vis = getVisible();
  const byCat = (cat) => vis.filter((i) => i.cat === cat);
  const secHtml = (title, items) =>
    items.length
      ? `<div class="section"><div class="section-title">${title}</div><div class="h-scroll-wrap"><div class="h-scroll">${items.map(eCardHtml).join('')}</div></div></div>`
      : '';
  const shEl = document.getElementById('sheetContent');
  if (shEl)
    shEl.innerHTML =
      secHtml('Events', byCat('event')) +
      secHtml('Konst', byCat('konst')) +
      secHtml('Mötesplatser', byCat('motes')) +
      secHtml('Musik', byCat('musik'));
  const spEl = document.getElementById('spBody');
  if (spEl) {
    const spSecHtml = (title, items) =>
      items.length
        ? `<div class="sp-section"><div class="sp-section-title">${title}</div>${items.map(spCardHtml).join('')}</div>`
        : '';
    spEl.innerHTML =
      spSecHtml('Events', byCat('event')) +
      spSecHtml('Konst', byCat('konst')) +
      spSecHtml('Mötesplatser', byCat('motes')) +
      spSecHtml('Musik', byCat('musik'));
  }
}

// ── ACTIVE CARD ───────────────────────────────────────────────────
function showActiveCard(id) {
  const prev = activeCardId;
  activeCardId = id;
  if (prev && prev !== id) refreshMarker(prev);
  refreshMarker(id);
  const item = ITEMS.find((x) => x.id === id);
  const meta =
    `<div class="meta-tag">${S.clock}${item.date} · ${item.time.split('–')[0]}</div>` +
    `<div class="meta-tag">${S.pin}${item.loc}</div>` +
    (item.free ? '<span class="free-badge">Gratis</span>' : '');
  if (isDesktop()) {
    const sacImg = document.getElementById('sacImg');
    sacImg.src = item.img;
    sacImg.alt = item.name;
    sacImg.onclick = () => openDetail(id);
    const sacTitle = document.getElementById('sacTitle');
    sacTitle.textContent = item.name;
    sacTitle.onclick = () => openDetail(id);
    document.getElementById('sacDesc').textContent = item.desc;
    document.getElementById('sacMeta').innerHTML = meta;
    document.getElementById('sacFlyBtn').onclick = () => openMapsSheet(item);
    document.getElementById('sacJoinBtn').onclick = () => openEventUrl(item);
    document.getElementById('spBody').style.display = 'none';
    document.getElementById('spActiveCard').style.display = 'flex';
  } else {
    const acImg = document.getElementById('acImg');
    acImg.src = item.img;
    acImg.alt = item.name;
    acImg.onclick = () => openDetail(id);
    const acTitle = document.getElementById('acTitle');
    acTitle.textContent = item.name;
    acTitle.onclick = () => openDetail(id);
    document.getElementById('acDesc').textContent = item.desc;
    document.getElementById('acMeta').innerHTML = meta;
    document.getElementById('acFlyBtn').onclick = () => openMapsSheet(item);
    document.getElementById('acJoinBtn').onclick = () => openEventUrl(item);
    document.getElementById('detBackBtn').onclick = closeDetail;
    hideSheet();
    document.getElementById('activeCard').classList.add('visible');
  }
  flyToItem(item);
}

function dismissActiveCard() {
  const prev = activeCardId;
  activeCardId = null;
  if (prev) refreshMarker(prev);
  if (isDesktop()) {
    document.getElementById('spActiveCard').style.display = 'none';
    document.getElementById('spBody').style.display = '';
  } else {
    const ac = document.getElementById('activeCard');
    const offY = ac.offsetHeight + 40;
    ac.style.transition = 'transform .32s cubic-bezier(.4,0,.6,1)';
    ac.style.transform = `translateY(${offY}px)`;
    ac.addEventListener(
      'transitionend',
      function done() {
        ac.removeEventListener('transitionend', done);
        ac.classList.remove('visible');
        ac.style.transition = '';
        ac.style.transform = '';
        expandSheet();
      },
      { once: true }
    );
  }
}

// ── FLY TO ────────────────────────────────────────────────────────
function flyToItem(item) {
  map.flyTo([item.lat, item.lng], 15, { duration: 0.7, easeLinearity: 0.5 });
  map.once('moveend', function () {
    const pt = map.latLngToContainerPoint([item.lat, item.lng]);
    const mapH = document.getElementById('mapWrap').offsetHeight;
    const topBarH = 160,
      bottomH = isDesktop() ? 40 : 380;
    const targetY = topBarH + (mapH - topBarH - bottomH) / 2;
    const panY = Math.round(pt.y - targetY);
    if (Math.abs(panY) > 8) map.panBy([0, panY], { animate: true, duration: 0.25 });
  });
}

// ── SHEET (mobile) ────────────────────────────────────────────────
const PEEK = 230;

function hideSheet() {
  const h = document.getElementById('sheetCard').offsetHeight + 40;
  document.getElementById('sheet').style.transform = `translateY(${h}px)`;
  collapsed = true;
}

function collapseSheet() {
  const h = document.getElementById('sheetCard').offsetHeight;
  document.getElementById('sheet').style.transform = `translateY(${h - PEEK}px)`;
  collapsed = true;
}

function expandSheet() {
  document.getElementById('sheet').style.transform = 'translateY(0)';
  collapsed = false;
}

let dY0,
  dT0,
  dDrag = false;

function setupSheetDrag() {
  const hw = document.getElementById('handleWrap');
  const body = document.getElementById('sheetContent').parentElement;
  const sh = document.getElementById('sheet');

  function onStart(y) {
    if (document.getElementById('activeCard').classList.contains('visible')) return;
    dDrag = true;
    dY0 = y;
    dT0 = collapsed ? document.getElementById('sheetCard').offsetHeight - PEEK : 0;
    sh.style.transition = 'none';
  }
  function onMove(y) {
    if (!dDrag) return;
    sh.style.transform = `translateY(${Math.max(0, dT0 + y - dY0)}px)`;
  }
  function onEnd(y) {
    if (!dDrag) return;
    dDrag = false;
    sh.style.transition = '';
    const dy = y - dY0;
    if (dy > 50) collapseSheet();
    else if (dy < -50) expandSheet();
    else collapsed ? collapseSheet() : expandSheet();
  }

  hw.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(e.touches[0].clientY); }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (dDrag) { e.preventDefault(); onMove(e.touches[0].clientY); } }, { passive: false });
  document.addEventListener('touchend', (e) => { if (dDrag) onEnd(e.changedTouches[0].clientY); }, { passive: true });
  hw.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; onStart(e.clientY); hw.setPointerCapture(e.pointerId); });
  hw.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; onMove(e.clientY); });
  hw.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') return; onEnd(e.clientY); });

  let bodyY0 = 0,
    bodyDrag = false;
  body.addEventListener('touchstart', (e) => {
    if (document.getElementById('activeCard').classList.contains('visible')) return;
    bodyY0 = e.touches[0].clientY;
    bodyDrag = false;
  }, { passive: true });
  body.addEventListener('touchmove', (e) => {
    if (document.getElementById('activeCard').classList.contains('visible')) return;
    const dy = e.touches[0].clientY - bodyY0;
    if (!collapsed && body.scrollTop === 0 && dy > 6) bodyDrag = true;
    if (bodyDrag) {
      e.preventDefault();
      sh.style.transition = 'none';
      sh.style.transform = `translateY(${Math.max(0, dy)}px)`;
    }
  }, { passive: false });
  body.addEventListener('touchend', (e) => {
    if (!bodyDrag) return;
    bodyDrag = false;
    sh.style.transition = '';
    const dy = e.changedTouches[0].clientY - bodyY0;
    if (dy > 80) collapseSheet();
    else expandSheet();
  }, { passive: true });
}

// ── ACTIVE CARD SWIPE DISMISS ────────────────────────────────────
function setupActiveCardSwipe() {
  const ac = document.getElementById('activeCard');
  let acY0 = 0,
    acDrag = false;
  ac.addEventListener('touchstart', (e) => {
    if (!ac.classList.contains('visible')) return;
    acDrag = true;
    acY0 = e.touches[0].clientY;
    ac.style.transition = 'none';
  }, { passive: true });
  ac.addEventListener('touchmove', (e) => {
    if (!acDrag) return;
    const dy = e.touches[0].clientY - acY0;
    if (dy > 0) { e.preventDefault(); ac.style.transform = `translateY(${dy}px)`; }
  }, { passive: false });
  ac.addEventListener('touchend', (e) => {
    if (!acDrag) return;
    acDrag = false;
    const dy = e.changedTouches[0].clientY - acY0;
    if (dy > 60) {
      const offY = ac.offsetHeight + 40;
      ac.style.transition = 'transform .32s cubic-bezier(.4,0,.6,1)';
      ac.style.transform = `translateY(${offY}px)`;
      ac.addEventListener('transitionend', function done() {
        ac.removeEventListener('transitionend', done);
        ac.classList.remove('visible');
        ac.style.transition = '';
        ac.style.transform = '';
        const prev = activeCardId;
        activeCardId = null;
        if (prev) refreshMarker(prev);
        expandSheet();
      }, { once: true });
    } else {
      ac.style.transition = 'transform .3s cubic-bezier(.32,.94,.6,1)';
      ac.style.transform = 'translateY(0)';
    }
  }, { passive: true });
}

// ── SEARCH ────────────────────────────────────────────────────────
function openSearch() {
  saveFocus();
  document.getElementById('searchScreen').classList.add('visible');
  setTimeout(() => document.getElementById('searchInput').focus(), 300);
  onSearch('');
}

function closeSearch() {
  document.getElementById('searchScreen').classList.remove('visible');
  document.getElementById('searchInput').value = '';
  restoreFocus();
}

function onSearch(q) {
  const res = document.getElementById('searchResults');
  const term = q.trim().toLowerCase();
  const hits = term
    ? ITEMS.filter((i) => i.name.toLowerCase().includes(term) || i.loc.toLowerCase().includes(term))
    : ITEMS;
  if (!hits.length) {
    res.innerHTML = `<div class="srch-empty">Inga resultat för "${q}"</div>`;
    return;
  }
  res.innerHTML = hits
    .map(
      (item) => `
    <div class="srch-card" data-item-id="${item.id}">
      <img class="srch-card-img" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async">
      <div class="srch-card-body">
        <div class="srch-card-title">${item.name}</div>
        <div class="srch-card-desc">${item.desc}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="srch-card-cat" style="background:${CAT_BG[item.cat]};color:${CAT_COLOR[item.cat]}">${CAT_LABEL[item.cat]}</span>
          ${item.free ? '<span class="free-badge">Gratis</span>' : ''}
        </div>
      </div>
    </div>`
    )
    .join('');
}

// ── DETAIL ────────────────────────────────────────────────────────
function openDetail(id) {
  const item = ITEMS.find((x) => x.id === id);
  if (!item) return;
  const col = CAT_COLOR[item.cat],
    bg = CAT_BG[item.cat],
    lbl = CAT_LABEL[item.cat];
  const icoFn = (c) => CAT_SVG_W[item.cat].replace(/stroke="white"/g, `stroke="${c}"`);
  document.getElementById('detInner').innerHTML = `
    <img class="det-hero" src="${item.img}" alt="${item.name}" decoding="async">
    <div class="det-card">
      <div style="text-align:center">
        <div style="display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:40px;background:${bg};color:${col};font-size:13px;font-weight:600;margin:0 0 10px">${icoFn(col)}${lbl}</div>
        <div class="det-title">${item.name}</div>
        <div class="det-subtitle">${item.desc}</div>
      </div>
      <div class="det-stats">
        <div class="det-stat"><div class="det-stat-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#333" stroke-width="1.8"/><path d="M8 2v4M16 2v4M3 10h18" stroke="#333" stroke-width="1.8" stroke-linecap="round"/></svg></div><div class="det-stat-val">${item.date}</div></div>
        <div class="det-stat"><div class="det-stat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="#333" stroke-width="1.8" stroke-linejoin="round"/></svg></div><div class="det-stat-val">${item.loc}</div></div>
        <div class="det-stat"><div class="det-stat-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#333" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="#333" stroke-width="1.8" stroke-linecap="round"/></svg></div><div class="det-stat-val">${item.time}</div></div>
      </div>
      <p class="det-desc">${item.longDesc}</p>
      <div class="det-map-label">Var det är</div>
      <div class="det-map" id="detMapEl"></div>
      <div class="det-addr-name">${item.loc}</div>
      <div class="det-addr-street">${item.addr}</div>
      <div class="det-divider"></div>
      <div class="det-host">
        <div class="det-host-logo">ABF</div>
        <div><div class="det-host-name">Hosted av ${item.host}</div><div class="det-host-since">Arrangör i Huddinge Kommun</div></div>
      </div>
    </div>`;
  document.getElementById('detFlyBtn').onclick = () => openMapsSheet(item);
  document.getElementById('detJoinBtn').onclick = () => openEventUrl(item);
  document.getElementById('detBackBtn').onclick = closeDetail;
  document.getElementById('detBottom').classList.add('visible');
  const ds = document.getElementById('detailScreen');
  ds.classList.add('visible');
  ds.scrollTop = 0;
  setTimeout(() => document.getElementById('detBackBtn')?.focus(), 80);
  if (detailMapInstance) { detailMapInstance.remove(); detailMapInstance = null; }
  setTimeout(() => {
    const el = document.getElementById('detMapEl');
    if (!el) return;
    detailMapInstance = L.map(el, {
      center: [item.lat, item.lng],
      zoom: 15,
      zoomControl: false,
      interactive: false,
      dragging: false,
    });
    L.tileLayer(TILE_URL, { subdomains: 'abcd', attribution: TILE_ATTRIBUTION }).addTo(detailMapInstance);
    const pi = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${col};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([item.lat, item.lng], { icon: pi }).addTo(detailMapInstance);
    setTimeout(() => detailMapInstance.invalidateSize(), 50);
  }, 100);
}

function closeDetail() {
  document.getElementById('detailScreen').classList.remove('visible');
  document.getElementById('detBottom').classList.remove('visible');
  restoreFocus();
}

// ── ACTION SHEET ─────────────────────────────────────────────────
function showActionSheet(opts) {
  const bg = document.getElementById('actionSheetBg');
  const el = document.getElementById('actionSheet');
  document.getElementById('actionSheetOptions').innerHTML = opts
    .map(
      (o, i) => `
    <button data-opt-index="${i}" style="width:100%;padding:17px 16px;background:none;border:none;border-top:${i > 0 ? '0.5px solid rgba(0,0,0,.15)' : 'none'};font-family:'Inter',sans-serif;font-size:17px;font-weight:${o.bold ? '600' : '400'};color:${o.bold ? '#000' : '#007aff'};text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px">
      ${o.label}${o.subtitle ? `<span style="font-size:13px;font-weight:400;color:rgba(0,0,0,.45)">${o.subtitle}</span>` : ''}
    </button>`
    )
    .join('');
  el._opts = opts;
  bg.style.pointerEvents = 'auto';
  bg.style.background = 'rgba(0,0,0,.15)';
  el.style.transform = 'translateY(0)';
}

function closeActionSheet() {
  document.getElementById('actionSheetBg').style.cssText = 'background:rgba(0,0,0,0);pointer-events:none';
  document.getElementById('actionSheet').style.transform = 'translateY(calc(100% + 12px))';
}

function actionSheetTap(i) {
  const o = document.getElementById('actionSheet')._opts[i];
  closeActionSheet();
  if (o?.action) o.action();
}

function openMapsSheet(item) {
  showActionSheet([
    {
      label: '🗺️ Öppna i Apple Kartor',
      action: () => window.open(`https://maps.apple.com/?daddr=${item.lat},${item.lng}&dirflg=d`, '_blank'),
    },
    {
      label: '📍 Öppna i Google Maps',
      action: () =>
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank'),
    },
  ]);
}

function openEventUrl(item) {
  const host = item.url.replace(/https?:\/\//, '').replace(/\/.*/, '');
  showActionSheet([
    {
      label: `Öppna ${host}`,
      subtitle: `Mer info om ${item.name}`,
      bold: true,
      action: () => window.open(item.url, '_blank'),
    },
  ]);
}

// ── DOM WIRING — all event listeners in one place ─────────────────
function initDom() {
  // Search
  document.getElementById('spSearchBtn').addEventListener('click', openSearch);
  document.getElementById('searchPillBtn').addEventListener('click', openSearch);
  document.getElementById('searchCancelBtn').addEventListener('click', closeSearch);
  document.getElementById('searchInput').addEventListener('input', (e) => onSearch(e.target.value));

  // Filter panel
  document.getElementById('spFilterBtn').addEventListener('click', toggleFilter);
  document.getElementById('mFilterBtn').addEventListener('click', toggleFilter);
  document.getElementById('filterBg').addEventListener('click', closeFilter);
  document.getElementById('filterCloseBtn').addEventListener('click', closeFilter);
  document.getElementById('freeToggle').addEventListener('change', applyFilters);
  document.getElementById('filterResetBtn').addEventListener('click', resetFilters);
  document.getElementById('filterApplyBtn').addEventListener('click', closeFilter);

  // Active card back button (desktop side panel)
  document.getElementById('sacBackBtn').addEventListener('click', dismissActiveCard);

  // Action sheet dismiss
  document.getElementById('actionSheetBg').addEventListener('click', closeActionSheet);
  document.getElementById('actionSheetCancelBtn').addEventListener('click', closeActionSheet);

  // Category chips — event delegation on both chip containers
  const chipHandler = (_e, el) => selectCat(el.dataset.cat);
  delegate(document.getElementById('chips'), '[data-cat]', chipHandler);
  delegate(document.getElementById('spChips'), '[data-cat]', chipHandler);

  // Content cards — event delegation on each scroll container
  delegate(document.getElementById('sheetContent'), '[data-item-id]', (_e, el) =>
    showActiveCard(Number(el.dataset.itemId))
  );
  delegate(document.getElementById('spBody'), '[data-item-id]', (_e, el) =>
    showActiveCard(Number(el.dataset.itemId))
  );

  // Search results — close search then show card
  delegate(document.getElementById('searchResults'), '[data-item-id]', (_e, el) => {
    closeSearch();
    showActiveCard(Number(el.dataset.itemId));
  });

  // Action sheet options
  delegate(document.getElementById('actionSheetOptions'), '[data-opt-index]', (_e, el) =>
    actionSheetTap(Number(el.dataset.optIndex))
  );

  // Escape key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('filterPanel').classList.contains('open')) { closeFilter(); return; }
    if (document.getElementById('searchScreen').classList.contains('visible')) { closeSearch(); return; }
    if (document.getElementById('detailScreen').classList.contains('visible')) { closeDetail(); return; }
    if (document.getElementById('actionSheet').style.transform === 'translateY(0)') closeActionSheet();
  });
}

// ── BOOT ─────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  fetch('/data/items.json')
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((data) => {
      ITEMS = data.items;
      ORGS_LIST = data.orgs;
      AREAS_LIST = data.areas;
      initDom();
      initMap();
      initFilterChips();
      renderChips();
      renderContent();
      setupSheetDrag();
      setupActiveCardSwipe();
      requestAnimationFrame(() => {
        document.getElementById('sheet').style.transition = 'none';
        collapseSheet();
        requestAnimationFrame(() => {
          document.getElementById('sheet').style.transition = '';
        });
      });
    })
    .catch((err) => console.error('Failed to load /data/items.json:', err));
});
