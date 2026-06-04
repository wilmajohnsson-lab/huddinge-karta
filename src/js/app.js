// ── Imports ───────────────────────────────────────────────────────
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Self-hosted Inter (Latin subset — covers Swedish åäö) replaces Google Fonts CDN
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
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
  event: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.757 10.164L3.8 16.073c.192 1.088 1.229 1.814 2.317 1.622l3.979-.701M2.757 10.164l-.347-1.97C2.218 7.106 2.944 6.069 4.032 5.877L12.896 4.314c1.088-.192 2.125.534 2.317 1.622l.173.985c.096.544-.267 1.063-.811 1.159L2.757 10.164ZM16 12v2l1.667 1.667M22 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  musik: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.998 18.5c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Zm0 0V7.488c0-.884.579-1.663 1.425-1.916l6-1.8c1.283-.385 2.575.576 2.575 1.916V15.5m0 0c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  konst: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" stroke="white" stroke-width="2.5"/><circle cx="6.5" cy="11.5" r="1.5" fill="white"/><circle cx="9.5" cy="7" r="1.5" fill="white"/><circle cx="14.5" cy="7" r="1.5" fill="white"/><circle cx="17.5" cy="11.5" r="1.5" fill="white"/></svg>`,
  teater: `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="1.5" stroke="white" stroke-width="2.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  samhalle: `<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="6" r="2.5" stroke="white" stroke-width="2.5"/><circle cx="17" cy="6" r="2.5" stroke="white" stroke-width="2.5"/><path d="M2 22v-4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22v-4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  fritid: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="3" r="3" stroke="white" stroke-width="2.5"/><path d="M12 6L12 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M12 9L6 12.5L8.5 16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9L17.5 7L15.5 11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14L6.5 18.5L9 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14L17.5 18.5L16 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  spel: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="white" stroke-width="2.5"/><rect x="6" y="18" width="12" height="2" rx="1" stroke="white" stroke-width="2.5"/><circle cx="9" cy="9" r="1" stroke="white" stroke-width="2.5"/><circle cx="15" cy="9" r="1" stroke="white" stroke-width="2.5"/></svg>`,
  hantverk: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 1l12 22" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M20 1L8 23" stroke="white" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="13" r="7" stroke="white" stroke-width="2.5"/><path d="M7.5 11c2 2 5.5 2.5 8.5 1" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M6.5 16c2 1.5 6.5 2 9.5 0" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  film: `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="1" stroke="white" stroke-width="2.5"/><rect x="1.5" y="3" width="3" height="5" rx="0.5" stroke="white" stroke-width="2"/><rect x="1.5" y="9" width="3" height="5" rx="0.5" stroke="white" stroke-width="2"/><rect x="1.5" y="15" width="3" height="5" rx="0.5" stroke="white" stroke-width="2"/><rect x="19.5" y="3" width="3" height="5" rx="0.5" stroke="white" stroke-width="2"/><rect x="19.5" y="9" width="3" height="5" rx="0.5" stroke="white" stroke-width="2"/><rect x="19.5" y="15" width="3" height="5" rx="0.5" stroke="white" stroke-width="2"/></svg>`,
  kurs: `<svg viewBox="0 0 24 24" fill="none"><path d="M2 4h7a4 4 0 0 1 3 1.5V20a3.5 3.5 0 0 0-3-1.5H2V4z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4h-7a4 4 0 0 0-3 1.5V20a3.5 3.5 0 0 1 3-1.5h7V4z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  kultur: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="2.5"/><ellipse cx="12" cy="12" rx="4.5" ry="9" stroke="white" stroke-width="2"/><path d="M3 12h18" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M4.5 7.5c3.5-1.5 11.5-1.5 15 0" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M4.5 16.5c3.5 1.5 11.5 1.5 15 0" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  plats: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  litteratur: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  museum: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 10h18M3 10V8l9-5 9 5v2M3 10v10h18V10M7 14v2M11 14v2M15 14v2" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  skola: `<svg viewBox="0 0 24 24" fill="none"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12v5c3.33 2 8.67 2 12 0v-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dans: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4" r="1.5" stroke="white" stroke-width="2.5"/><path d="M12 5.5v6l-3 4m3-4l3 4M9 9.5l-2 1.5m8-1.5l2 1.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  poesi: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bradspel: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="white" stroke-width="2.5"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="white" stroke-width="2.5" stroke-linecap="round"/><circle cx="9" cy="13" r="1.5" fill="white"/><circle cx="15" cy="13" r="1.5" fill="white"/></svg>`,
  lokal: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// SVGs with currentColor stroke (for chips)
const CHIP_SVGS = {
  event: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.757 10.164L3.8 16.073c.192 1.088 1.229 1.814 2.317 1.622l3.979-.701M2.757 10.164l-.347-1.97C2.218 7.106 2.944 6.069 4.032 5.877L12.896 4.314c1.088-.192 2.125.534 2.317 1.622l.173.985c.096.544-.267 1.063-.811 1.159L2.757 10.164ZM16 12v2l1.667 1.667M22 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  musik: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.998 18.5c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Zm0 0V7.488c0-.884.579-1.663 1.425-1.916l6-1.8c1.283-.385 2.575.576 2.575 1.916V15.5m0 0c0 1.38-1.343 2.5-3 2.5s-3-1.12-3-2.5 1.343-2.5 3-2.5 3 1.12 3 2.5Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  konst: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" stroke="currentColor" stroke-width="2.5"/><circle cx="6.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="9.5" cy="7" r="1.5" fill="currentColor"/><circle cx="14.5" cy="7" r="1.5" fill="currentColor"/><circle cx="17.5" cy="11.5" r="1.5" fill="currentColor"/></svg>`,
  teater: `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" stroke-width="2.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  samhalle: `<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="6" r="2.5" stroke="currentColor" stroke-width="2.5"/><circle cx="17" cy="6" r="2.5" stroke="currentColor" stroke-width="2.5"/><path d="M2 22v-4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22v-4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  fritid: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="3" r="3" stroke="currentColor" stroke-width="2.5"/><path d="M12 6L12 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M12 9L6 12.5L8.5 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9L17.5 7L15.5 11" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14L6.5 18.5L9 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14L17.5 18.5L16 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  spel: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/><rect x="6" y="18" width="12" height="2" rx="1" stroke="currentColor" stroke-width="2.5"/><circle cx="9" cy="9" r="1" stroke="currentColor" stroke-width="2.5"/><circle cx="15" cy="9" r="1" stroke="currentColor" stroke-width="2.5"/></svg>`,
  hantverk: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 1l12 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20 1L8 23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="13" r="7" stroke="currentColor" stroke-width="2.5"/><path d="M7.5 11c2 2 5.5 2.5 8.5 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6.5 16c2 1.5 6.5 2 9.5 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  film: `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" stroke-width="2.5"/><rect x="1.5" y="3" width="3" height="5" rx="0.5" stroke="currentColor" stroke-width="2"/><rect x="1.5" y="9" width="3" height="5" rx="0.5" stroke="currentColor" stroke-width="2"/><rect x="1.5" y="15" width="3" height="5" rx="0.5" stroke="currentColor" stroke-width="2"/><rect x="19.5" y="3" width="3" height="5" rx="0.5" stroke="currentColor" stroke-width="2"/><rect x="19.5" y="9" width="3" height="5" rx="0.5" stroke="currentColor" stroke-width="2"/><rect x="19.5" y="15" width="3" height="5" rx="0.5" stroke="currentColor" stroke-width="2"/></svg>`,
  kurs: `<svg viewBox="0 0 24 24" fill="none"><path d="M2 4h7a4 4 0 0 1 3 1.5V20a3.5 3.5 0 0 0-3-1.5H2V4z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4h-7a4 4 0 0 0-3 1.5V20a3.5 3.5 0 0 1 3-1.5h7V4z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  kultur: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5"/><ellipse cx="12" cy="12" rx="4.5" ry="9" stroke="currentColor" stroke-width="2"/><path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4.5 7.5c3.5-1.5 11.5-1.5 15 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4.5 16.5c3.5 1.5 11.5 1.5 15 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  plats: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  litteratur: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  museum: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 10h18M3 10V8l9-5 9 5v2M3 10v10h18V10M7 14v2M11 14v2M15 14v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  skola: `<svg viewBox="0 0 24 24" fill="none"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12v5c3.33 2 8.67 2 12 0v-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dans: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4" r="1.5" stroke="currentColor" stroke-width="2.5"/><path d="M12 5.5v6l-3 4m3-4l3 4M9 9.5l-2 1.5m8-1.5l2 1.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  poesi: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bradspel: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="9" cy="13" r="1.5" fill="currentColor"/><circle cx="15" cy="13" r="1.5" fill="currentColor"/></svg>`,
  lokal: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const CAT_COLOR = { event: '#D63D3D', musik: '#C94091', konst: '#008296', teater: '#BE5A00', samhalle: '#008296', fritid: '#3D8700', spel: '#BE5A00', hantverk: '#BE5A00', film: '#D63D3D', kurs: '#3D8700', kultur: '#C94091', plats: '#C94091', litteratur: '#3D8700', museum: '#008296', skola: '#3D8700', dans: '#C94091', poesi: '#C94091', bradspel: '#BE5A00', lokal: '#D63D3D' };
const CAT_LABEL = { event: 'Event', musik: 'Musik', konst: 'Konst', teater: 'Teater', samhalle: 'Samhälle', fritid: 'Fritid', spel: 'Spel', hantverk: 'Hantverk', film: 'Film', kurs: 'Kurs', kultur: 'Kultur', plats: 'Platser', litteratur: 'Litteratur', museum: 'Museum', skola: 'Skola', dans: 'Dans', poesi: 'Poesi', bradspel: 'Brädspel', lokal: 'Lokal' };
const CTA_LABEL = { buy: 'Köp biljett', apply: 'Anmäl mig', info: 'Mer info' };
const ALL_CAT = '__all__';

/** Fire an Umami custom event if the tracker has loaded. */
function track(event, props) {
  if (typeof window.umami === 'object' && typeof window.umami.track === 'function') {
    window.umami.track(event, props);
  }
}

let _searchTrackTimer = null;

// Tab-based category lists
const EVENT_CATS = ['musik', 'konst', 'teater', 'samhalle', 'fritid', 'spel', 'hantverk', 'film', 'kurs', 'kultur', 'litteratur', 'dans', 'poesi'];
const PLATS_CATS = ['konst', 'plats'];
const PLATS_SET = new Set(PLATS_CATS);

/** Derive item type from collection source or category.
 *  _source is stamped in loadAndBoot so events with cat='konst' (e.g. Konstrunda)
 *  are never accidentally routed to the Platser tab. */
function itemType(item) {
  if (item._source === 'event') return 'event';
  if (item._source === 'konst' || item._source === 'aktor') return 'plats';
  // Fallback for items loaded without _source stamp
  if (item.type) return 'plats';
  if (item.cat === 'plats') return 'plats';
  return PLATS_SET.has(item.cat) ? 'plats' : 'event';
}

// ── DATA ──────────────────────────────────────────────────────────
let ITEMS = [], ORGS_LIST = [], AREAS_LIST = [];

// ── STATE ─────────────────────────────────────────────────────────
let map, leafMarkers = {}, clusters = [], activeIds = [];
let selectedCats = new Set(), activeTab = 'event', detailMapInstance = null;
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

/**
 * Build an Unsplash URL at a given width with auto=format so Unsplash
 * negotiates AVIF/WebP. Items.json URLs already include ?w=600&q=80; we
 * override w per render context (thumbnail vs hero).
 */
function unsplashUrl(u, width) {
  if (!isSafeHttpUrl(u)) return '';
  try {
    const url = new URL(u);
    if (url.host !== 'images.unsplash.com') return u;
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', '75');
    url.searchParams.set('auto', 'format');
    return url.toString();
  } catch {
    return u;
  }
}

/** Return src + srcset (1x/2x) HTML attributes for a responsive image. */
function imgSrc(u, width) {
  const x1 = unsplashUrl(u, width);
  const x2 = unsplashUrl(u, width * 2);
  if (!x1) return '';
  return `src="${esc(x1)}" srcset="${esc(x1)} 1x, ${esc(x2)} 2x"`;
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
    zoom: 14,
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

  // Show place name labels at zoom >= 16 (B.10)
  function updateLabelVisibility() {
    document.getElementById('map').classList.toggle('labels-visible', map.getZoom() >= 16);
  }
  // B.11 zoom hint — shown once per session when user first reaches zoom 14-15
  let _zoomHintShown = !!sessionStorage.getItem('zoom-hint-shown');
  function updateZoomHint() {
    if (_zoomHintShown) return;
    const z = map.getZoom();
    if (z >= 14 && z < 16) {
      _zoomHintShown = true;
      sessionStorage.setItem('zoom-hint-shown', '1');
      const hint = document.getElementById('zoomHint');
      if (hint) {
        hint.textContent = 'Zooma in för att se platsnamn';
        hint.classList.add('visible');
        setTimeout(() => hint.classList.remove('visible'), 3500);
      }
    }
  }
  map.on('zoomend', () => { updateLabelVisibility(); updateZoomHint(); });
  updateLabelVisibility();
}

function mHtml(cat, big, label = null) {
  const sz = big ? 'mpin-lg' : 'mpin-sm';
  const activeClass = big ? ' mpin-active' : '';
  const catClass = CAT_COLOR[cat] ? `cat-${cat}` : '';
  const icon = CAT_SVG_W[cat] || CAT_SVG_W['event'];
  const lbl = label ? `<div class="pin-label">${esc(label)}</div>` : '';
  return `<div class="mpin ${sz}${activeClass} ${catClass}">
    <div class="mpin-tail"></div>
    <div class="mpin-circle">${icon}</div>
    ${lbl}
  </div>`;
}

function mClusterHtml(cluster, big) {
  const sz = big ? 'mpin-lg' : 'mpin-sm';
  const activeClass = big ? ' mpin-active' : '';
  const cats = [...new Set(cluster.items.map((i) => i.cat))];
  const isMulti = cats.length > 1;
  const catClass = isMulti ? 'mpin-multi' : (CAT_COLOR[cats[0]] ? `cat-${cats[0]}` : '');
  return `<div class="mpin ${sz}${activeClass} ${catClass}">
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
  if (first) {
    track('Pin Click', { category: first.cat, type: itemType(first) });
    map.flyTo([first.lat, first.lng], 15, { duration: 0.7, easeLinearity: 0.5 });
  }
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
    <img class="ev-card-img" ${imgSrc(item.img, 600)} width="600" height="320" alt="${esc(item.name)}" loading="lazy" decoding="async">
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
        ${item.free ? '<span class="free-badge">Gratis</span>' : (typeof item.pris === 'number' && item.pris > 0 ? `<span class="ev-tag">${item.pris} kr</span>` : '')}
        ${item.registration === false ? '<span class="ev-tag ev-tag-noreg">Ingen anmälan krävs</span>' : ''}
      </div>
      <div class="ev-card-btns">
        <button class="btn-ghost" data-action="detail" data-item-id="${Number(item.id)}">Mer info</button>
        ${item.cta && CTA_LABEL[item.cta] ? `<button class="btn-dark" data-action="join" data-item-id="${Number(item.id)}">${CTA_LABEL[item.cta]}</button>` : ''}
      </div>
    </div>
  </div>`;
}

// ── TAB NAVIGATION ────────────────────────────────────────────────
function setTab(tab) {
  track('Tab', { tab });
  activeTab = tab;
  selectedCats = new Set();
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
    if (selectedCats.size > 0 && !selectedCats.has(i.cat)) return false;
    if (filterState.free && !i.free) return false;
    if (filterState.orgs.size > 0 && !filterState.orgs.has(i.host)) return false;
    if (filterState.areas.size > 0 && !filterState.areas.has(i.area)) return false;
    return true;
  });
}

function applyFilters() {
  filterState.free = document.getElementById('freeToggle').checked;
  track('Filter', { free: String(filterState.free), orgs: String(filterState.orgs.size), areas: String(filterState.areas.size) });
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
  if (cat === ALL_CAT) {
    selectedCats = new Set();
  } else {
    if (selectedCats.has(cat)) {
      selectedCats.delete(cat);
    } else {
      selectedCats.add(cat);
    }
  }
  renderChips();
  applyFilters();
}

function chipHtml(cat) {
  const allShown = selectedCats.size === 0;
  // "Alla"-chippet är aktivt när ingen kategori är vald.
  if (cat === ALL_CAT) {
    return `<button class="chip chip-all${allShown ? ' chip-on' : ''}" data-cat="${ALL_CAT}" aria-pressed="${allShown}">Alla</button>`;
  }
  // When no filter active: chips appear in their light colour (chip-on-all).
  // When a specific filter active: matching chip fills dark (chip-on), others dim.
  const isAll  = allShown;
  const isOn   = !allShown && selectedCats.has(cat);
  const isDim  = !allShown && !selectedCats.has(cat);
  const stateClass = isAll ? ' chip-on-all' : (isOn ? ' chip-on' : (isDim ? ' chip-dim' : ''));
  return `<button class="chip cat-${esc(cat)}${stateClass}" data-cat="${esc(cat)}" aria-pressed="${isAll || isOn}">
    ${CHIP_SVGS[cat] || ''}${CAT_LABEL[cat]}
  </button>`;
}

function renderChips() {
  const cats = activeTab === 'platser' ? PLATS_CATS : EVENT_CATS;
  const html = [ALL_CAT, ...cats].map(chipHtml).join('');
  const tc = document.getElementById('topChips');
  if (tc) tc.innerHTML = html;
}

function renderCalendarChips() {
  const cats = EVENT_CATS;
  const html = [ALL_CAT, ...cats].map(chipHtml).join('');
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
  document.getElementById('calIdag')?.classList.remove('active');
  renderDpCalendar();
  renderCalendar();
}

function setTodayFilter() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Toggle off if already active
  if (selectedDate && selectedDate.getTime() === today.getTime()) {
    clearDateFilter();
    return;
  }
  selectedDate = today;
  dpYear = today.getFullYear();
  dpMonth = today.getMonth();
  document.getElementById('dpClearBtn').style.display = 'block';
  document.getElementById('calDatumBtn').classList.add('active');
  document.getElementById('calIdag')?.classList.add('active');
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
    <img class="cal-card-img" ${imgSrc(item.img, 600)} width="600" height="320" alt="${esc(item.name)}" loading="lazy" decoding="async">
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
  // Debounced Umami event (fires 600 ms after user stops typing)
  clearTimeout(_searchTrackTimer);
  if (term) _searchTrackTimer = setTimeout(() => track('Search', { query: term }), 600);
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
      <img class="srch-card-img" ${imgSrc(item.img, 160)} width="160" height="160" alt="${esc(item.name)}" loading="lazy" decoding="async">
      <div class="srch-card-body">
        <div class="srch-card-title">${esc(item.name)}</div>
        <div class="srch-card-desc">${esc(item.desc)}</div>
        <div class="srch-card-tags">
          <span class="srch-card-cat cat-${esc(item.cat)}" data-cat="${esc(item.cat)}">${CAT_LABEL[item.cat]}</span>
          ${item.free ? '<span class="free-badge">Gratis</span>' : (typeof item.pris === 'number' && item.pris > 0 ? `<span class="ev-tag">${item.pris} kr</span>` : '')}
          ${item.registration === false ? '<span class="ev-tag ev-tag-noreg">Ingen anmälan krävs</span>' : ''}
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
    <img class="det-hero" ${imgSrc(item.img, 1200)} width="1200" height="600" alt="${esc(item.name)}" decoding="async" fetchpriority="high">
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
      <button class="det-host" id="detHostBtn" aria-label="Visa alla från ${esc(item.host)}">
        <div class="det-host-logo cat-${esc(item.cat)}" data-cat="${esc(item.cat)}">${initials}</div>
        <div class="det-host-info">
          <div class="det-host-name">${esc(item.host)}</div>
          <div class="det-host-since">Arrangör i Huddinge · <span class="det-host-cta">Visa alla</span></div>
        </div>
      </button>
    </div>`;

  document.getElementById('detFlyBtn').onclick = () => openMapsSheet(item);
  // CTA-knappen visas bara om item.cta finns; etikett växlar på cta-typ.
  const detJoin = document.getElementById('detJoinBtn');
  if (item.cta && CTA_LABEL[item.cta]) {
    detJoin.textContent = CTA_LABEL[item.cta];
    detJoin.hidden = false;
    detJoin.onclick = () => openEventUrl(item);
  } else {
    detJoin.hidden = true;
    detJoin.onclick = null;
  }
  document.getElementById('detBackBtn').onclick = closeDetail;
  // B.9: tap host → filter map to all items by that organiser
  document.getElementById('detHostBtn').addEventListener('click', () => {
    const host = item.host;
    closeDetail();
    filterState.orgs.clear();
    filterState.orgs.add(host);
    setTab(itemType(item) === 'plats' ? 'platser' : 'event');
    applyFilters();
  });
  track('Detail View', { category: item.cat, name: item.name });
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
  // Prefer the explicit cta_url (registration / ticket link) over the generic url
  const target = item.cta_url || item.url;
  if (!target || !isSafeHttpUrl(target)) {
    showActionSheet([{ label: `Kontakta ${item.host}`, subtitle: `Arrangör av ${item.name}`, bold: true, action: () => {} }]);
    return;
  }
  let host = '';
  try { host = new URL(target).host; } catch { /* fall through */ }
  const url = target;
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
  document.getElementById('calIdag').addEventListener('click', setTodayFilter);
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
  return fetch('/data/items-combined.json', { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((data) => {
      if (!data) throw new Error('Invalid data shape');
      
      // Transform: events stay mostly as-is, konst and aktorer get prepared for platser tab
      const events = (data.events || []).map(e => ({
        _source: 'event',
        ...e,
        cat: e.cat || 'event',
        date: e.date || '',
        time: e.time || '',
        host: e.host || '',
        loc: e.loc || '',
        desc: e.desc || '',
        free: e.free !== false,
        area: e.area || '',
        img: e.img || '',
        lat: e.lat || 0,
        lng: e.lng || 0,
        longDesc: e.desc || '',
        url: e.url || '',
      }));
      
      const konst = (data.konst || []).map(k => ({
        _source: 'konst',
        ...k,
        id: k.id || `konst-${Math.random()}`,
        cat: 'konst',
        date: k.year || '',
        time: '',
        host: k.artist || '',
        loc: k.loc || '',
        desc: k.artist || '',
        free: true,
        area: k.area || '',
        img: k.img || '',
        lat: k.lat || 0,
        lng: k.lng || 0,
        longDesc: k.longDesc || k.desc || '',
        url: '',
      }));
      
      const aktorer = (data.aktorer || []).map(a => ({
        _source: 'aktor',
        ...a,
        id: a.id || `aktor-${Math.random()}`,
        cat: 'plats',
        date: '',
        time: '',
        host: a.org || '',
        loc: a.name || '',
        desc: a.type || '',
        free: true,
        area: a.area || '',
        img: a.img || '',
        lat: a.lat || 0,
        lng: a.lng || 0,
        longDesc: '',
        url: a.url || '',
        type: a.type || '', // Preserve type for filtering on Platser tab
      }));
      
      // Combine all items
      ITEMS = [...events, ...konst, ...aktorer];
      
      // Extract unique orgs and areas
      ORGS_LIST = [
        ...new Set([
          ...events.map(e => e.host).filter(Boolean),
          ...konst.map(k => k.host).filter(Boolean),
          ...aktorer.map(a => a.host).filter(Boolean),
        ]),
      ].sort();
      
      AREAS_LIST = [
        ...new Set([
          ...events.map(e => e.area).filter(Boolean),
          ...konst.map(k => k.area).filter(Boolean),
          ...aktorer.map(a => a.area).filter(Boolean),
        ]),
      ].map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name })).sort((a, b) => a.name.localeCompare(b.name));
      
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
      console.error('Failed to load /data/items-combined.json:', err);
      showLoadError(err && err.message ? err.message : 'okänt fel');
    });
}

window.addEventListener('load', loadAndBoot);

// Surface uncaught errors to console for ops; never throw past the boundary.
window.addEventListener('error', (e) => console.error('[uncaught]', e.message, e.error));
window.addEventListener('unhandledrejection', (e) => console.error('[unhandled-rejection]', e.reason));
