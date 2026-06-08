# Huddinge Karta

An interactive map of events, art, meeting places, and music in Huddinge municipality, Sweden.

Built with [Leaflet.js](https://leafletjs.com/) + vanilla JavaScript. Map tiles served by [CARTO](https://carto.com/attributions).

## Features

- 🗺️ Interactive map with category markers
- 🔍 Full-text search across events and locations
- 🎨 Three-tab layout: **Events** (Musik · Samhälle · Konst · Fritid · Litteratur · Kultur · Teater), **Platser** (Konst · Plats), and **Calendar** view
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
├── index.html                    # App entry point
├── src/
│   ├── css/styles.css            # All application styles
│   └── js/app.js                 # All application logic
├── public/
│   ├── data/
│   │   └── items-combined.json   # Canonical data: events, konst, aktorer, orgs, areas
│   └── images/                   # Local images for actors and art
├── scripts/                      # Data import, validation, and build helpers
│   ├── import_excel.py           # Import Excel sheets → PocketBase
│   ├── import_pb.py              # Bulk import from PocketBase
│   ├── validate-items.mjs        # Validate items-combined.json
│   ├── transform-data.mjs        # Data transform utilities
│   ├── fetch-favicons.mjs        # Fetch org favicons
│   └── deploy.sh                 # Manual deploy script
├── deploy/                       # Server configs and publish hook
│   ├── nginx.conf                # nginx server block
│   ├── Caddyfile                 # Caddy equivalent
│   ├── publish.pb.js             # PocketBase publish hook (reference copy)
│   └── README.md                 # Step-by-step server setup guide
├── docs/                         # Operational documentation
├── test/                         # Unit tests (Vitest)
├── Source/                       # Source Excel spreadsheets (not served)
├── package.json
├── vite.config.js
├── CONTRIBUTING.md
├── LAUNCH.md
├── SECRETS.md
├── LICENSE
└── CREDITS.md
```

## Adding or Editing Content

The canonical data file is **`public/data/items-combined.json`**. It has five top-level arrays:

```json
{
  "events":  [ /* cultural events */ ],
  "konst":   [ /* public art */ ],
  "aktorer": [ /* venues and organisations */ ],
  "orgs":    [ /* organisation metadata */ ],
  "areas":   [ /* area definitions */ ]
}
```

In practice, content is managed via the PocketBase admin UI at
`https://huddinge-admin.mreh.site` and published to `items-combined.json`
automatically by the publish hook (`deploy/publish.pb.js`). You can also edit
the JSON directly for quick fixes.

**Event fields** (`events[]`):

```json
{
  "id": "ev_14",
  "cat": "musik",
  "name": "Konsert i parken",
  "desc": "Short description",
  "longDesc": "Full description...",
  "date": "12 Jun",
  "time": "18:00–20:00",
  "loc": "Huddinge Centrum",
  "addr": "Kommunalvägen 28",
  "host": "Huddinge Kommun",
  "area": "huddinge",
  "free": true,
  "pris": 0,
  "registration": false,
  "img": "/images/bilder_aktorer/huddinge_bibliotek.jpg",
  "url": "https://...",
  "lat": 59.2358,
  "lng": 17.9832
}
```

**Konst fields** (`konst[]`):
```json
{ "id": "k_7", "cat": "konst", "name": "Skulpturens namn", "artist": "Konstnärens Namn",
  "year": 1998, "loc": "Platsens namn", "desc": "...", "longDesc": "...",
  "area": "flemingsberg", "img": "/images/bilder_konst/skulptur.jpg",
  "utomhus": true, "lat": 59.22, "lng": 17.94 }
```

**Aktor fields** (`aktorer[]`):
```json
{ "id": "a_3", "cat": "plats", "type": "bibliotek", "name": "Visningsnamn",
  "org": "Org-ID", "area": "huddinge", "addr": "Gatan 1",
  "img": "/images/bilder_aktorer/bibliotek.jpg",
  "url": "https://...", "lat": 59.23, "lng": 17.98 }
```

Valid **event `cat`** values:
`musik` · `samhalle` · `konst` · `fritid` · `litteratur` · `kultur` · `teater` · `film` · `dans` · `poesi` · `kurs` · `hantverk` · `spel` · `bradspel` · `museum` · `skola` · `lokal`

Valid **aktor `cat`**: `plats`

Valid `area` ids: `flemingsberg` · `huddinge` · `skogas` · `sjodalen` · `glomsta` · `vistaberg` · `lida`

Run `npm run validate` after editing to catch schema errors.

## Deployment

The site builds to `dist/` — copy that directory to any web server.

### Self-hosted: nginx or Caddy (primary)

See **[`deploy/README.md`](deploy/README.md)** for the full server setup guide.
Ready-to-use configs are in `deploy/`:

```
deploy/
  nginx.conf   # nginx server block (TLS, headers, caching, SPA routing)
  Caddyfile    # Caddy equivalent (auto-HTTPS, same policy)
  README.md    # Step-by-step server setup + Proxmox LXC notes
```

Manual deploy from your machine:

```bash
DEPLOY_HOST=your-server.se ./scripts/deploy.sh
# or with a specific user / SSH key:
DEPLOY_HOST=your-server.se DEPLOY_USER=www-data DEPLOY_SSH_KEY=~/.ssh/deploy_key ./scripts/deploy.sh
```

Automated deploy via GitHub Actions (push to `main`):
Set the following in your GitHub repository settings:

| Kind | Name | Description |
|------|------|-------------|
| Secret | `DEPLOY_SSH_KEY` | Private SSH key for the deploy user on the server |
| Secret | `DEPLOY_PATH` | Absolute path on the server (e.g. `/var/www/huddinge-karta`) |
| Secret | `CF_ACCESS_CLIENT_ID` | Cloudflare Access service token ID (for SSH tunnel) |
| Secret | `CF_ACCESS_CLIENT_SECRET` | Cloudflare Access service token secret |
| Variable | `DEPLOY_TUNNEL_HOST` | Cloudflare Access SSH tunnel hostname |

See `deploy/README.md` for how to generate the deploy keypair.

### Netlify (optional staging / preview)

`netlify.toml` is kept as a convenience for quick preview environments.
Connect the repo in the Netlify dashboard — build command and publish directory
are already configured. Note: Netlify's `_headers` file delivers the CSP;
for production use the nginx/Caddy configs instead.

## Map Tile Attribution

This project uses CARTO tile layers. Attribution is **always visible** on the map as required
by the [CARTO attribution policy](https://carto.com/attributions) and
[OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

> ⚠️ Do not re-enable `attributionControl: false` or hide the `.leaflet-control-attribution`
> element via CSS — this violates the tile provider terms of service.

## License

MIT — see [LICENSE](LICENSE).  
Photo credits — see [CREDITS.md](CREDITS.md).
