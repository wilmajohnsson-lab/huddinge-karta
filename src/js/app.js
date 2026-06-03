// ── Imports ───────────────────────────────────────────────────────
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/styles.css';

// ── Tile provider ─────────────────────────────────────────────────
const TILE_URL =
  import.meta.env.VITE_TILE_URL ||
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

// ── SVGs (white stroke for map pins) ─────────────────────────────
const CAT_SVG_W = {
  event: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.757 10.164L3.8 16.073c.192 1.088 1.229 1.814 2.317 1.622l3.979-.701M2.757 10.164l-.347-1.97C2.218 7.106 2.944 6.069 4.032 5.877L12.896 4.314c1.088-.192 2.125.534 2.317 1.622l.173.985c.096.544-.267 1.063-.811 1.159L2.757 10.164ZM16 12v2l1.667 1.667M22 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  konst: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="white" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="white" stroke-width="2"/><path d="M21 15l-5-5L5 21" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  motes: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>`,
  musik: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.998 18.5c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Zm0 0V7.488c0-.884.579-1.663 1.425-1.916l6-1.8c1.283-.385 2.575.576 2.575 1.916V15.5m0 0c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>`,
};

// SVGs with currentColor stroke (for chips)
const CHIP_SVGS = {
  event: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.757 10.164L3.8 16.073c.192 1.088 1.229 1.814 2.317 1.622l3.979-.701M2.757 10.164l-.347-1.97C2.218 7.106 2.944 6.069 4.032 5.877L12.896 4.314c1.088-.192 2.125.534 2.317 1.622l.173.985c.096.544-.267 1.063-.811 1.159L2.757 10.164ZM16 12v2l1.667 1.667M22 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  konst: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  motes: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  musik: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.998 18.5c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Zm0 0V7.488c0-.884.579-1.663 1.425-1.916l6-1.8c1.283-.385 2.575.576 2.575 1.916V15.5m0 0c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
};

const CAT_COLOR = { event: '#bf5917', konst: '#068a99', motes: '#c0136f', musik: '#c3a523' };
const CAT_LABEL = { event: 'Event', konst: 'Konst', motes: 'Mötesplats', musik: 'Musik' };

// Tab-based category lists
const EVENT_CATS = ['event', 'musik'];
const PLATS_CATS = ['konst', 'motes'];
const PLATS_SET = new Set(PLATS_CATS);

/** Derive item type from category */
function itemType(item) {
  return PLATS_SET.has(item.cat) ? 'plats' : 'event';
}

// ── DATA ──────────────────────────────────────────────────────────
let ITEMS = [], ORGS_LIST = [], AREAS_LIST = [];

// ── STATE ─────────────────────────────────────────────────────────
let map, leafMarkers = {}, clusters = [], activeIds = [];
let selectedCat = null, activeTab = 'event', detailMapInstance = null;
const filterState = { free: false, orgs: new Set(), areas: new Set() };
let selectedDate = null;
let dpYear = new Date().getFullYear(), dpMonth = new Date().getMonth();

// ── HELPERS ───────────────────────────────────────────────────────

/** Escape a value for safe inclusion in HTML text or attribute contexts. */
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Return true only for http(s) URLs — used to gate window.open and href/src. */
function isSafeHttpUrl(u) {
  try {
    const url = new URL(u, window.location.origin);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Return an HTML-attribute-safe URL or '' if the URL is not safe. */
function attrUrl(u) {
  return isSafeHttpUrl(u) ? esc(u) : '';
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

function trapFocus(el) {
  const sel = 'button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
  const first = el.querySelector(sel);
  if (first) first.focus();
}

function saveFocus() {
  _lastFocus = document.activeElement;
}

function restoreFocus() {
  if (_lastFocus) { _lastFocus.focus(); _lastFocus = null; }
}

// ── CLUSTER HELPERS ───────────────────────────────────────────────
function clusterKey(lat, lng) {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

function buildClusters(items) {
  const result = [];
  items.forEach((item) => {
    const c = result.find(
      (c) => Math.abs(c.lat - item.lat) < 0.0002 && Math.abs(c.lng - item.lng) < 0.0002
    );
    if (c) c.items.push(item);
    else result.push({ lat: item.lat, lng: item.lng, items: [item], key: clusterKey(item.lat, item.lng) });
  });
  return result;
}

// ── MAP ───────────────────────────────────────────────────────────
const BOUNDS = L.latLngBounds([59.08, 17.73], [59.34, 18.24]);

function initMap() {
  map = L.map('map', {
    center: [59.218, 17.978],
    zoom: 13,
    minZoom: 11,
    maxZoom: 19,
    maxBounds: BOUNDS,
    maxBoundsViscosity: 1,
    zoomControl: false,
    attributionControl: false,
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

  rebuildClusterMarkers();

  map.on('click', () => {
    if (activeIds.length) dismissCards();
  });
  window.addEventListener('resize', () => map.invalidateSize());

  // Show place name labels at zoom >= 15
  function updateLabelVisibility() {
    document.getElementById('map').classList.toggle('labels-visible', map.getZoom() >= 15);
  }
  map.on('zoomend', updateLabelVisibility);
  updateLabelVisibility();
}

function mHtml(cat, big, label = null) {
  const sz = big ? 'mpin-lg' : 'mpin-sm';
  const catClass = CAT_COLOR[cat] ? `cat-${cat}` : '';
  const icon = CAT_SVG_W[cat] || CAT_SVG_W['event'];
  const lbl = label ? `<div class="pin-label">${esc(label)}</div>` : '';
  return `<div class="mpin ${sz} ${catClass}">
    <div class="mpin-tail"></div>
    <div class="mpin-circle">${icon}</div>
    ${lbl}
  </div>`;
}

function mClusterHtml(cluster, big) {
  const sz = big ? 'mpin-lg' : 'mpin-sm';
  const cats = [...new Set(cluster.items.map((i) => i.cat))];
  const isMulti = cats.length > 1;
  const catClass = isMulti ? 'mpin-multi' : (CAT_COLOR[cats[0]] ? `cat-${cats[0]}` : '');
  return `<div class="mpin ${sz} ${catClass}">
    <div class="mpin-tail"></div>
    <div class="mpin-circle flex-center">
      <span class="mpin-cluster-num">${cluster.items.length}</span>
    </div>
  </div>`;
}

function addClusterMarker(cluster) {
  const isActive = cluster.items.some((i) => activeIds.includes(i.id));
  const single = cluster.items.length === 1;
  const item = cluster.items[0];
  const label = single && itemType(item) === 'plats' ? item.name : null;
  const html = single
    ? mHtml(item.cat, isActive, label)
    : mClusterHtml(cluster, isActive);
  const sz = isActive ? 87.6 : 62.7;
  const icon = L.divIcon({ html, className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz] });
  const m = L.marker([cluster.lat, cluster.lng], { icon }).addTo(map);
  m.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    showCards(cluster.items.map((i) => i.id));
  });
  leafMarkers[cluster.key] = m;
}

function refreshClusterByItemId(id) {
  const cluster = clusters.find((c) => c.items.some((i) => i.id === id));
  if (!cluster) return;
  const m = leafMarkers[cluster.key];
  if (!m) return;
  const isActive = cluster.items.some((i) => activeIds.includes(i.id));
  const single = cluster.items.length === 1;
  const item0 = cluster.items[0];
  const label = single && itemType(item0) === 'plats' ? item0.name : null;
  const html = single
    ? mHtml(item0.cat, isActive, label)
    : mClusterHtml(cluster, isActive);
  const sz = isActive ? 87.6 : 62.7;
  m.setIcon(L.divIcon({ html, className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz] }));
}

function rebuildClusterMarkers() {
  Object.values(leafMarkers).forEach((m) => { try { map.removeLayer(m); } catch (e) { void e; } });
  leafMarkers = {};
  clusters = buildClusters(getVisible());
  clusters.forEach(addClusterMarker);
}

// ── CARD PANEL ────────────────────────────────────────────────────
function showCards(ids) {
  const prevIds = [...activeIds];
  activeIds = ids;
  prevIds.forEach((id) => { if (!activeIds.includes(id)) refreshClusterByItemId(id); });
  activeIds.forEach(refreshClusterByItemId);

  const scroll = document.getElementById('cardScroll');
  scroll.innerHTML = activeIds
    .map((id) => {
      const item = ITEMS.find((x) => x.id === id);
      return item ? evCardHtml(item) : '';
    })
    .join('');

  scroll.classList.toggle('single-card', activeIds.length === 1);
  document.getElementById('cardPanel').classList.add('visible');
  document.getElementById('tabBar').classList.add('hidden');
  document.getElementById('backBtn').classList.add('visible');
  document.getElementById('topBar').style.opacity = '0';
  document.getElementById('topBar').style.pointerEvents = 'none';

  const first = ITEMS.find((x) => x.id === ids[0]);
  if (first) map.flyTo([first.lat, first.lng], 15, { duration: 0.7, easeLinearity: 0.5 });
}

function dismissCards() {
  const prevIds = [...activeIds];
  activeIds = [];
  prevIds.forEach(refreshClusterByItemId);
  document.getElementById('cardPanel').classList.remove('visible');
  document.getElementById('cardScroll').classList.remove('single-card');
  document.getElementById('tabBar').classList.remove('hidden');
  document.getElementById('backBtn').classList.remove('visible');
  document.getElementById('topBar').style.opacity = '';
  document.getElementById('topBar').style.pointerEvents = '';
}

// ── CARD HTML ─────────────────────────────────────────────────────
const S_CLOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const S_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;

function evCardHtml(item) {
  const isPlats = itemType(item) === 'plats';
  const dateLine = !isPlats
    ? `<span class="ev-tag">${S_CLOCK}${esc(item.date)} · ${esc(item.time.split('–')[0].split('-')[0])}</span>`
    : '';
  return `<div class="ev-card" data-item-id="${Number(item.id)}" role="listitem">
    <img class="ev-card-img" src="${attrUrl(item.img)}" alt="${esc(item.name)}" loading="lazy" decoding="async">
    <div class="ev-card-body">
      <div class="ev-card-top">
        <div>
          <div class="ev-card-name">${esc(item.name)}</div>
          <div class="ev-card-desc">${esc(item.desc)}</div>
        </div>
      </div>
      <div class="ev-card-tags">
        ${dateLine}
        <span class="ev-tag">${S_PIN}${esc(item.loc)}</span>
        <span class="ev-tag ev-tag-cat cat-${esc(item.cat)}">${CAT_LABEL[item.cat]}</span>
        ${item.free ? '<span class="free-badge">Gratis</span>' : ''}
      </div>
      <div class="ev-card-btns">
        <button class="btn-ghost" data-action="detail" data-item-id="${Number(item.id)}">Mer info</button>
        <button class="btn-dark" data-action="join" data-item-id="${Number(item.id)}">Ansök</button>
      </div>
    </div>
  </div>`;
}

// ── TAB NAVIGATION ────────────────────────────────────────────────
function setTab(tab) {
  activeTab = tab;
  selectedCat = null;
  document.querySelectorAll('.tab-btn').forEach((b) => {
    const active = b.dataset.tab === tab;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  const calView = document.getElementById('calendarView');
  if (tab === 'kalender') {
    calView.classList.add('visible');
    renderCalendarChips();
    renderCalendar();
  } else {
    calView.classList.remove('visible');
    renderChips();
    applyFilters();
  }
}

// ── FILTER LOGIC ──────────────────────────────────────────────────
function getVisible() {
  return ITEMS.filter((i) => {
    const type = itemType(i);
    if (activeTab === 'event' && type !== 'event') return false;
    if (activeTab === 'platser' && type !== 'plats') return false;
    if (activeTab === 'kalender' && type !== 'event') return false;
    if (selectedCat && i.cat !== selectedCat) return false;
    if (filterState.free && !i.free) return false;
    if (filterState.orgs.size > 0 && !filterState.orgs.has(i.host)) return false;
    if (filterState.areas.size > 0 && !filterState.areas.has(i.area)) return false;
    return true;
  });
}

function applyFilters() {
  filterState.free = document.getElementById('freeToggle').checked;
  rebuildClusterMarkers();
  updateFilterBtnState();
}

function updateFilterBtnState() {
  const active = filterState.free || filterState.orgs.size > 0 || filterState.areas.size > 0;
  document.getElementById('filterBtn')?.classList.toggle('active', active);
  document.getElementById('calFilterBtn')?.classList.toggle('active', active);
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
  document.getElementById('filterBtn')?.setAttribute('aria-expanded', 'true');
  document.getElementById('calFilterBtn')?.setAttribute('aria-expanded', 'true');
  trapFocus(fp);
}

function closeFilter() {
  document.getElementById('filterPanel').classList.remove('open');
  const bg = document.getElementById('filterBg');
  bg.style.background = 'rgba(0,0,0,0)';
  bg.style.pointerEvents = 'none';
  document.getElementById('filterBtn')?.setAttribute('aria-expanded', 'false');
  document.getElementById('calFilterBtn')?.setAttribute('aria-expanded', 'false');
  restoreFocus();
}

// ── CATEGORY CHIPS ────────────────────────────────────────────────
function selectCat(cat) {
  selectedCat = selectedCat === cat ? null : cat;
  renderChips();
  applyFilters();
}

function chipHtml(cat) {
  const isOn = selectedCat === cat;
  const isDim = selectedCat !== null && !isOn;
  return `<button class="chip cat-${esc(cat)}${isOn ? ' chip-on' : ''}${isDim ? ' chip-dim' : ''}" data-cat="${esc(cat)}" aria-pressed="${isOn}">
    ${CHIP_SVGS[cat] || ''}${CAT_LABEL[cat]}
  </button>`;
}

function renderChips() {
  const cats = activeTab === 'platser' ? PLATS_CATS : EVENT_CATS;
  const html = cats.map(chipHtml).join('');
  const tc = document.getElementById('topChips');
  if (tc) tc.innerHTML = html;
}

function renderCalendarChips() {
  const cats = EVENT_CATS;
  const html = cats.map(chipHtml).join('');
  const cc = document.getElementById('calChips');
  if (cc) cc.innerHTML = html;
}

// ── DATE PICKER ───────────────────────────────────────────────────
const SMONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dec: 12 };
const SMONTH_NAMES = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];

function parseEventDate(str) {
  const s = str.toLowerCase().trim();
  // Cross-month range: "30 maj–10 jun"
  let m = s.match(/^(\d+)\s+([a-zåäö]+)–(\d+)\s+([a-zåäö]+)$/);
  if (m) {
    const mo1 = (SMONTHS[m[2].substring(0, 3)] || 1) - 1;
    const mo2 = (SMONTHS[m[4].substring(0, 3)] || 1) - 1;
    const yr = new Date().getFullYear();
    return { start: new Date(yr, mo1, +m[1]), end: new Date(yr, mo2, +m[3]) };
  }
  // Same-month range: "10–30 jun"
  m = s.match(/^(\d+)–(\d+)\s+([a-zåäö]+)$/);
  if (m) {
    const mo = (SMONTHS[m[3].substring(0, 3)] || 1) - 1;
    const yr = new Date().getFullYear();
    return { start: new Date(yr, mo, +m[1]), end: new Date(yr, mo, +m[2]) };
  }
  // Single date: "12 jun"
  m = s.match(/^(\d+)\s+([a-zåäö]+)$/);
  if (m) {
    const mo = (SMONTHS[m[2].substring(0, 3)] || 1) - 1;
    const yr = new Date().getFullYear();
    const d = new Date(yr, mo, +m[1]);
    return { start: d, end: d };
  }
  return null;
}

function eventMatchesDate(item, date) {
  const p = parseEventDate(item.date);
  if (!p) return true; // ongoing/permanent — always show
  return date >= p.start && date <= p.end;
}

function openDatePicker() {
  saveFocus();
  const bg = document.getElementById('dateBg');
  bg.style.pointerEvents = 'auto';
  bg.style.background = 'rgba(0,0,0,.4)';
  document.getElementById('dateSheet').classList.add('open');
  renderDpCalendar();
  trapFocus(document.getElementById('dateSheet'));
}

function closeDatePicker() {
  document.getElementById('dateSheet').classList.remove('open');
  const bg = document.getElementById('dateBg');
  bg.style.background = 'rgba(0,0,0,0)';
  bg.style.pointerEvents = 'none';
  restoreFocus();
}

function dpPrevMonth() {
  dpMonth--;
  if (dpMonth < 0) { dpMonth = 11; dpYear--; }
  renderDpCalendar();
}

function dpNextMonth() {
  dpMonth++;
  if (dpMonth > 11) { dpMonth = 0; dpYear++; }
  renderDpCalendar();
}

function clearDateFilter() {
  selectedDate = null;
  document.getElementById('dpClearBtn').style.display = 'none';
  document.getElementById('calDatumBtn').classList.remove('active');
  renderDpCalendar();
  renderCalendar();
}

function selectDay(year, month, day) {
  selectedDate = new Date(year, month, day);
  document.getElementById('dpClearBtn').style.display = 'block';
  document.getElementById('calDatumBtn').classList.add('active');
  renderDpCalendar();
  renderCalendar();
  setTimeout(closeDatePicker, 180);
}

function renderDpCalendar() {
  document.getElementById('dpMonthLabel').textContent = SMONTH_NAMES[dpMonth] + ' ' + dpYear;
  const firstDay = new Date(dpYear, dpMonth, 1).getDay();
  const offset = (firstDay + 6) % 7; // Mon=0
  const daysInMonth = new Date(dpYear, dpMonth + 1, 0).getDate();

  // Count events per day
  const eventCount = {};
  ITEMS.filter((i) => itemType(i) === 'event').forEach((item) => {
    const p = parseEventDate(item.date);
    if (!p) return;
    for (let d = new Date(p.start); d <= p.end; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === dpYear && d.getMonth() === dpMonth) {
        const day = d.getDate();
        eventCount[day] = (eventCount[day] || 0) + 1;
      }
    }
  });

  const today = new Date();
  const isThisMonth = today.getFullYear() === dpYear && today.getMonth() === dpMonth;
  let html = '';
  for (let i = 0; i < offset; i++) html += `<div class="dp-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isSel = selectedDate && selectedDate.getFullYear() === dpYear && selectedDate.getMonth() === dpMonth && selectedDate.getDate() === d;
    const cnt = eventCount[d] || 0;
    const isToday = isThisMonth && today.getDate() === d;
    const badge = cnt > 0 ? `<span class="dp-day-count">${cnt}</span>` : '';
    html += `<button class="dp-day${isSel ? ' selected' : ''}${isToday ? ' today' : ''}" data-dp-day="${d}" data-dp-year="${dpYear}" data-dp-month="${dpMonth}">${d}${badge}</button>`;
  }
  document.getElementById('dpDays').innerHTML = html;
  document.getElementById('dpClearBtn').style.display = selectedDate ? 'block' : 'none';
}

// ── CALENDAR VIEW ─────────────────────────────────────────────────
function calCardHtml(item) {
  return `<div class="cal-card" data-item-id="${Number(item.id)}">
    <img class="cal-card-img" src="${attrUrl(item.img)}" alt="${esc(item.name)}" loading="lazy" decoding="async">
    <div class="cal-card-body">
      <div class="cal-card-name">${esc(item.name)}</div>
      <div class="cal-card-desc">${esc(item.desc)}</div>
      <div class="cal-card-tags">
        <span class="cal-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          ${esc(item.date)}
        </span>
        <span class="cal-tag cal-tag-cat cat-${esc(item.cat)}">${CAT_LABEL[item.cat]}</span>
        ${item.free ? '<span class="cal-tag cal-tag-free">Gratis</span>' : ''}
      </div>
    </div>
  </div>`;
}

function renderCalendar() {
  let vis = getVisible();
  if (selectedDate) vis = vis.filter((i) => eventMatchesDate(i, selectedDate));

  // Group by month keyword in date string
  const groups = [
    { label: 'Juni', items: vis.filter((i) => i.date.toLowerCase().includes('jun')) },
    { label: 'Juli', items: vis.filter((i) => i.date.toLowerCase().includes('jul')) },
    { label: 'Maj', items: vis.filter((i) => i.date.toLowerCase().includes('maj')) },
    { label: 'Övrigt', items: vis.filter((i) => !['jun', 'jul', 'maj'].some((m) => i.date.toLowerCase().includes(m))) },
  ].filter((g) => g.items.length);

  const el = document.getElementById('calContent');
  el.innerHTML = groups.length
    ? groups.map((g) => `
      <div class="cal-section">
        <div class="cal-section-title">${g.label}</div>
        <div class="cal-h-scroll">${g.items.map(calCardHtml).join('')}</div>
      </div>`).join('')
    : '<div class="cal-empty">Inga events på valt datum</div>';
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
    ? ITEMS.filter((i) =>
        i.name.toLowerCase().includes(term) ||
        i.loc.toLowerCase().includes(term) ||
        i.host.toLowerCase().includes(term)
      )
    : ITEMS;
  if (!hits.length) {
    res.innerHTML = `<div class="srch-empty">Inga resultat för "${esc(q)}"</div>`;
    return;
  }
  res.innerHTML = hits
    .map(
      (item) => `
    <div class="srch-card" data-item-id="${Number(item.id)}">
      <img class="srch-card-img" src="${attrUrl(item.img)}" alt="${esc(item.name)}" loading="lazy" decoding="async">
      <div class="srch-card-body">
        <div class="srch-card-title">${esc(item.name)}</div>
        <div class="srch-card-desc">${esc(item.desc)}</div>
        <div class="srch-card-tags">
          <span class="srch-card-cat cat-${esc(item.cat)}" data-cat="${esc(item.cat)}">${CAT_LABEL[item.cat]}</span>
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
  const col = CAT_COLOR[item.cat];
  const lbl = CAT_LABEL[item.cat];
  const icoForColor = (c) => (CAT_SVG_W[item.cat] || '').replace(/stroke="white"/g, `stroke="${c}"`);
  const initials = esc(item.host.split(' ').map((w) => w[0] || '').slice(0, 3).join(''));
  const isPlats = itemType(item) === 'plats';

  document.getElementById('detInner').innerHTML = `
    <img class="det-hero" src="${attrUrl(item.img)}" alt="${esc(item.name)}" decoding="async">
    <div class="det-card">
      <div class="det-center-text">
        <div class="det-cat-badge cat-${esc(item.cat)}" data-cat="${esc(item.cat)}">${icoForColor(col)}${lbl}</div>
        <div class="det-title">${esc(item.name)}</div>
        <div class="det-subtitle">${esc(item.desc)}</div>
      </div>
      <div class="det-stats">
        <div class="det-stat">
          <div class="det-stat-icon"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M12 3c.828 0 1.5.672 1.5 1.5V6h9V4.5C22.5 3.672 23.172 3 24 3s1.5.672 1.5 1.5V6H27c2.485 0 4.5 2.015 4.5 4.5V13.5H4.5V10.5C4.5 8.015 6.515 6 9 6h1.5V4.5C10.5 3.672 11.172 3 12 3z" fill="#068A99"/><path d="M4.5 27V16.5h27V27c0 2.485-2.015 4.5-4.5 4.5H9C6.515 31.5 4.5 29.485 4.5 27z" fill="#47C1CE" fill-opacity="0.4"/></svg></div>
          <div class="det-stat-val">${esc(item.date)}</div>
        </div>
        <div class="det-stat">
          <div class="det-stat-icon"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 15C6 8.373 11.373 3 18 3s12 5.373 12 12c0 3.711-1.641 7.138-3.554 9.891C24.522 27.66 22.224 29.889 20.688 31.236A1.984 1.984 0 0 1 18 31.236C16.464 29.889 14.165 27.66 12.554 24.891 10.641 22.138 9 18.711 9 15zM17.997 18.75c2.071 0 3.75-1.679 3.75-3.75s-1.679-3.75-3.75-3.75-3.75 1.679-3.75 3.75 1.679 3.75 3.75 3.75z" fill="#47C1CE" fill-opacity="0.4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M17.997 18.75c2.071 0 3.75-1.679 3.75-3.75s-1.679-3.75-3.75-3.75-3.75 1.679-3.75 3.75 1.679 3.75 3.75 3.75z" fill="#068A99"/></svg></div>
          <div class="det-stat-val">${esc(item.loc)}</div>
        </div>
        <div class="det-stat">
          <div class="det-stat-icon"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 33c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15C9.716 3 3 9.716 3 18c0 8.284 6.716 15 15 15zm1.5-21a1.5 1.5 0 0 0-3 0v6c0 .398.158.779.44 1.06l3.75 3.75a1.5 1.5 0 1 0 2.12-2.12L19.5 17.378V12z" fill="#47C1CE" fill-opacity="0.4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M18 10.5c.828 0 1.5.672 1.5 1.5v5.379l3.31 3.31a1.5 1.5 0 1 1-2.12 2.122l-3.75-3.75A1.5 1.5 0 0 1 16.5 18v-6c0-.828.672-1.5 1.5-1.5z" fill="#068A99"/></svg></div>
          <div class="det-stat-val">${esc(isPlats ? item.date : item.time)}</div>
        </div>
      </div>
      <p class="det-desc">${esc(item.longDesc)}</p>
      <div class="det-map-label">Var det är</div>
      <div class="det-map" id="detMapEl"></div>
      <div class="det-addr-name">${esc(item.loc)}</div>
      <div class="det-addr-street">${esc(item.addr)}</div>
      <div class="det-divider"></div>
      <div class="det-host">
        <div class="det-host-logo cat-${esc(item.cat)}" data-cat="${esc(item.cat)}">${initials}</div>
        <div>
          <div class="det-host-name">Hosted av ${esc(item.host)}</div>
          <div class="det-host-since">Arrangör i Huddinge</div>
        </div>
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
      attributionControl: false,
      interactive: false,
      dragging: false,
    });
    L.tileLayer(TILE_URL, { subdomains: 'abcd' }).addTo(detailMapInstance);
    const pi = L.divIcon({
      html: `<div class="det-pin-dot cat-${esc(item.cat)}"></div>`,
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
  if (detailMapInstance) { detailMapInstance.remove(); detailMapInstance = null; }
  restoreFocus();
}

// ── ACTION SHEET ──────────────────────────────────────────────────
function showActionSheet(opts) {
  const bg = document.getElementById('actionSheetBg');
  const el = document.getElementById('actionSheet');
  document.getElementById('actionSheetOptions').innerHTML = opts
    .map(
      (o, i) => `
    <button class="as-btn${o.bold ? ' as-btn-bold' : ''}" data-opt-index="${i}">
      ${esc(o.label)}${o.subtitle ? `<span class="as-btn-sub">${esc(o.subtitle)}</span>` : ''}
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
  const lat = Number(item.lat), lng = Number(item.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  showActionSheet([
    {
      label: '🗺️ Öppna i Apple Kartor',
      action: () => window.open(`https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`, '_blank', 'noopener,noreferrer'),
    },
    {
      label: '📍 Öppna i Google Maps',
      action: () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer'),
    },
  ]);
}

function openEventUrl(item) {
  if (!item.url || !isSafeHttpUrl(item.url)) {
    showActionSheet([{ label: `Kontakta ${item.host}`, subtitle: `Arrangör av ${item.name}`, bold: true, action: () => {} }]);
    return;
  }
  let host = '';
  try { host = new URL(item.url).host; } catch { /* fall through */ }
  const url = item.url;
  showActionSheet([
    {
      label: `Öppna ${host}`,
      subtitle: `Mer info om ${item.name}`,
      bold: true,
      action: () => window.open(url, '_blank', 'noopener,noreferrer'),
    },
  ]);
}

// ── DOM WIRING ────────────────────────────────────────────────────
function initDom() {
  // Tab bar
  delegate(document.getElementById('tabBar'), '[data-tab]', (_e, el) => setTab(el.dataset.tab));
  document.getElementById('searchTabBtn').addEventListener('click', openSearch);

  // Filter
  document.getElementById('filterBtn').addEventListener('click', toggleFilter);
  document.getElementById('calFilterBtn').addEventListener('click', toggleFilter);
  document.getElementById('filterBg').addEventListener('click', closeFilter);
  document.getElementById('filterCloseBtn').addEventListener('click', closeFilter);
  document.getElementById('freeToggle').addEventListener('change', applyFilters);
  document.getElementById('filterResetBtn').addEventListener('click', resetFilters);
  document.getElementById('filterApplyBtn').addEventListener('click', closeFilter);

  // Card panel
  document.getElementById('backBtn').addEventListener('click', dismissCards);
  document.getElementById('closeCardBtn').addEventListener('click', dismissCards);

  // Card scroll — detail and join buttons
  delegate(document.getElementById('cardScroll'), '[data-action="detail"]', (_e, el) =>
    openDetail(Number(el.dataset.itemId))
  );
  delegate(document.getElementById('cardScroll'), '[data-action="join"]', (_e, el) => {
    const item = ITEMS.find((x) => x.id === Number(el.dataset.itemId));
    if (item) openEventUrl(item);
  });

  // Calendar chips
  delegate(document.getElementById('calChips'), '[data-cat]', (_e, el) => selectCat(el.dataset.cat));

  // Top chips
  delegate(document.getElementById('topChips'), '[data-cat]', (_e, el) => selectCat(el.dataset.cat));

  // Calendar cards
  delegate(document.getElementById('calContent'), '[data-item-id]', (_e, el) => {
    setTab('event');
    setTimeout(() => showCards([Number(el.dataset.itemId)]), 400);
  });

  // Search
  document.getElementById('searchCancelBtn').addEventListener('click', closeSearch);
  document.getElementById('searchInput').addEventListener('input', (e) => onSearch(e.target.value));

  // Search results
  delegate(document.getElementById('searchResults'), '[data-item-id]', (_e, el) => {
    closeSearch();
    showCards([Number(el.dataset.itemId)]);
  });

  // Date picker
  document.getElementById('calDatumBtn').addEventListener('click', openDatePicker);
  document.getElementById('dpCloseBtn').addEventListener('click', closeDatePicker);
  document.getElementById('dateBg').addEventListener('click', closeDatePicker);
  document.getElementById('dpPrevBtn').addEventListener('click', dpPrevMonth);
  document.getElementById('dpNextBtn').addEventListener('click', dpNextMonth);
  document.getElementById('dpClearBtn').addEventListener('click', clearDateFilter);
  delegate(document.getElementById('dpDays'), '[data-dp-day]', (_e, el) =>
    selectDay(Number(el.dataset.dpYear), Number(el.dataset.dpMonth), Number(el.dataset.dpDay))
  );

  // Action sheet
  document.getElementById('actionSheetBg').addEventListener('click', closeActionSheet);
  document.getElementById('actionSheetCancelBtn').addEventListener('click', closeActionSheet);
  delegate(document.getElementById('actionSheetOptions'), '[data-opt-index]', (_e, el) =>
    actionSheetTap(Number(el.dataset.optIndex))
  );

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('filterPanel').classList.contains('open')) { closeFilter(); return; }
    if (document.getElementById('dateSheet').classList.contains('open')) { closeDatePicker(); return; }
    if (document.getElementById('searchScreen').classList.contains('visible')) { closeSearch(); return; }
    if (document.getElementById('detailScreen').classList.contains('visible')) { closeDetail(); return; }
    if (document.getElementById('actionSheet').style.transform === 'translateY(0)') { closeActionSheet(); return; }
    if (activeIds.length) dismissCards();
  });
}

// ── BOOT ─────────────────────────────────────────────────────────
function showLoadError(message) {
  let el = document.getElementById('loadErrorBanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loadErrorBanner';
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <div class="load-err-inner">
        <div class="load-err-text">
          <strong>Kunde inte ladda kartdata.</strong>
          <span id="loadErrorDetail"></span>
          <span>Kontrollera din anslutning och försök igen.</span>
        </div>
        <button type="button" id="loadErrorRetry" class="load-err-btn">Försök igen</button>
      </div>`;
    document.body.appendChild(el);
    document.getElementById('loadErrorRetry').addEventListener('click', () => {
      el.remove();
      loadAndBoot();
    });
  }
  document.getElementById('loadErrorDetail').textContent = message ? ' (' + message + ')' : '';
}

let _booted = false;
function loadAndBoot() {
  return fetch('/data/items.json', { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((data) => {
      if (!data || !Array.isArray(data.items)) throw new Error('Invalid data shape');
      ITEMS = data.items;
      ORGS_LIST = data.orgs || [];
      AREAS_LIST = data.areas || [];
      if (!_booted) {
        initDom();
        initMap();
        initFilterChips();
        _booted = true;
      } else {
        rebuildClusterMarkers();
        initFilterChips();
      }
      renderChips();
      renderCalendar();
    })
    .catch((err) => {
      console.error('Failed to load /data/items.json:', err);
      showLoadError(err && err.message ? err.message : 'okänt fel');
    });
}

window.addEventListener('load', loadAndBoot);

// Surface uncaught errors to console for ops; never throw past the boundary.
window.addEventListener('error', (e) => console.error('[uncaught]', e.message, e.error));
window.addEventListener('unhandledrejection', (e) => console.error('[unhandled-rejection]', e.reason));
