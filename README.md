# Huddinge Karta

An interactive map of events, art, meeting places, and music in Huddinge municipality, Sweden.

Built with [Leaflet.js](https://leafletjs.com/) + vanilla JavaScript. Map tiles served by [CARTO](https://carto.com/attributions).

## Features

- 🗺️ Interactive map with category markers
- 🔍 Full-text search across events and locations
- 🎨 Category filter chips (Events, Art, Meeting Places, Music)
- 🔧 Advanced filter panel (free entry, organiser, area)
- 📱 Mobile-first with swipeable bottom sheet
- 🖥️ Desktop sidebar layout
- 📍 Detail view with mini-map, directions, and event links

## Quick Start

```bash
# Install dependencies
npm install

# Start local dev server (hot-reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Then open http://localhost:5173 in your browser.

## Project Structure

```
├── index.html          # App entry point (references src/ assets)
├── src/
│   ├── css/styles.css  # All application styles
│   └── js/app.js       # All application logic (loads data via fetch)
├── public/
│   └── data/
│       └── items.json  # Event/location data (edit here to add content)
├── package.json
├── .gitignore
├── LICENSE
└── CREDITS.md
```

## Adding or Editing Content

All map items live in **`public/data/items.json`**. Edit that file to add, remove, or
update events and locations — no code changes needed.

Each item follows this shape:

```json
{
  "id": 14,
  "cat": "event",
  "name": "My Event",
  "desc": "Short description",
  "date": "12 Jun",
  "time": "18:00–20:00",
  "loc": "Huddinge Centrum",
  "img": "https://...",
  "lat": 59.2358,
  "lng": 17.9832,
  "host": "Huddinge Kommun",
  "area": "huddinge",
  "free": true,
  "addr": "Kommunalvägen 28",
  "url": "https://...",
  "longDesc": "Full description..."
}
```

Valid `cat` values: `"event"` · `"konst"` · `"motes"` · `"musik"`

Valid `area` ids: `flemingsberg` · `huddinge` · `skogas` · `sjodalen` · `glomsta` · `vistaberg` · `lida`

## Deployment

### Netlify (recommended)

1. Push this repo to GitHub.
2. Connect the repo in the [Netlify dashboard](https://app.netlify.com).
3. Set **Build command**: `npm run build` and **Publish directory**: `dist`.
4. Deploy — Netlify handles HTTPS and CDN automatically.

### GitHub Pages

```bash
npm run build
# Push dist/ to gh-pages branch, or configure a GitHub Actions workflow
```

## Map Tile Attribution

This project uses CARTO tile layers. Attribution is **always visible** on the map as required
by the [CARTO attribution policy](https://carto.com/attributions) and
[OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

> ⚠️ Do not re-enable `attributionControl: false` or hide the `.leaflet-control-attribution`
> element via CSS — this violates the tile provider terms of service.

## License

MIT — see [LICENSE](LICENSE).  
Photo credits — see [CREDITS.md](CREDITS.md).
