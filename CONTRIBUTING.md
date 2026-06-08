# Contributing to Huddinge Karta

Thank you for contributing! Huddinge Karta is a small single-page app (Vanilla ES modules + Vite) that shows events, culture and meeting places in Huddinge municipality on an interactive Leaflet map. Data is stored as JSON in `public/data/items-combined.json` and this guide explains how to run the app locally and contribute content or code.

---

## Prerequisites

- Node.js 22+ and npm
- A terminal / command line

## Local development

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open the app in your browser:

http://localhost:5173

## Adding or editing map items

The canonical data file is `public/data/items-combined.json`. It contains five
top-level arrays: `events`, `konst`, `aktorer`, `orgs`, and `areas`.

In the normal workflow content is managed through the PocketBase admin UI
(`https://huddinge-admin.mreh.site`) and the publish hook writes
`items-combined.json` automatically. You can also edit the JSON directly for
quick fixes.

- Edit `public/data/items-combined.json` to add or update events, art, or organisations.
- Run the validator before committing your changes:

```bash
npm run validate
# (If an npm script is not present you can also run:)
node scripts/validate-items.mjs
```

The validator checks structure and common mistakes (missing fields, wrong types, coordinates out of range, missing hosts/areas etc.) and will exit non-zero when there are errors.

### Field reference — events

| Field        | Type    | Required | Description |
|--------------|---------|----------|-------------|
| id           | string  | yes      | Unique string id (e.g. `ev_14`) |
| cat          | string  | yes      | Category (see valid values below) |
| name         | string  | yes      | Short title shown on the map |
| desc         | string  | yes      | Short description for popups/list |
| longDesc     | string  | yes      | Longer description for detail view |
| date         | string  | yes      | Human readable date or date range |
| time         | string  | yes      | Human readable time (e.g. `"17:00–19:00"`) |
| loc          | string  | yes      | Name of the location |
| addr         | string  | yes      | Street address / place description |
| lat          | number  | yes      | Latitude (59.08–59.34 for Huddinge) |
| lng          | number  | yes      | Longitude (17.73–18.24 for Huddinge) |
| img          | string  | yes      | Image URL or local path (e.g. `/images/bilder_aktorer/foo.jpg`) |
| url          | string  | yes      | Link to event/organisation (start with `https://`) |
| host         | string  | yes      | Hosting organisation — must exist in top-level `orgs` array |
| area         | string  | yes      | Area id — must match one of the `areas` ids |
| free         | boolean | yes      | `true` if the event is free of charge |
| pris         | number  | no       | Ticket price in SEK (0 = free) |
| registration | boolean | no       | `true` = sign-up required, `false` = no sign-up needed, `null` = unknown |

### Field reference — konst

| Field    | Type    | Required | Description |
|----------|---------|----------|-------------|
| id       | string  | yes      | Unique string id (e.g. `k_7`) |
| cat      | string  | yes      | Always `"konst"` |
| name     | string  | yes      | Artwork title |
| artist   | string  | yes      | Artist name |
| year     | number  | no       | Year created |
| loc      | string  | yes      | Location name |
| desc     | string  | yes      | Short description |
| longDesc | string  | no       | Extended description |
| area     | string  | yes      | Area id |
| img      | string  | yes      | Image path (local or `https://`) |
| utomhus  | boolean | no       | `true` if the artwork is outdoors |
| lat      | number  | yes      | Latitude |
| lng      | number  | yes      | Longitude |

### Field reference — aktorer

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| id    | string | yes      | Unique string id (e.g. `a_3`) |
| cat   | string | yes      | Always `"plats"` |
| type  | string | no       | Venue type (e.g. `bibliotek`, `galleri`) |
| name  | string | yes      | Display name |
| org   | string | no       | Organisation id (matches `orgs`) |
| area  | string | yes      | Area id |
| addr  | string | yes      | Street address |
| img   | string | yes      | Image path (local or `https://`) |
| url   | string | yes      | Website URL |
| lat   | number | yes      | Latitude |
| lng   | number | yes      | Longitude |

### Valid cat values

**Events** (`events[]`):
`musik` · `samhalle` · `konst` · `fritid` · `litteratur` · `kultur` · `teater` · `film` · `dans` · `poesi` · `kurs` · `hantverk` · `spel` · `bradspel` · `museum` · `skola` · `lokal`

**Konst** (`konst[]`): `konst`

**Aktorer** (`aktorer[]`): `plats`

### Area ids

The project currently defines these areas (id / name):

| id | name |
|----|------|
| flemingsberg | Flemingsberg |
| huddinge      | Huddinge |
| skogas        | Skogås |
| sjodalen      | Sjödalen |
| glomsta       | Glömsta |
| vistaberg     | Vistaberg |
| lida          | Lida |

When you set an item's `area` field it must match one of the `id` values shown above.

---

## Code style

- Linting: `npm run lint` (uses ESLint on `src/js`)
- Formatting: `npm run format` (Prettier)
- Follow existing patterns in the codebase. Keep scripts small and modular.
- Prefer `addEventListener(...)` for attaching handlers instead of inline attributes in HTML.

## Building

- Build for production:

```bash
npm run build
```

- Preview the production build locally:

```bash
npm run preview
```

The build output will be placed in `dist/`.

## Pull request process

1. Fork the repository and create a feature branch:

```bash
git checkout -b feat/your-short-description
```

or for bugfixes:

```bash
git checkout -b fix/short-description
```

2. Commit changes and push to your fork, then open a Pull Request against `main`.
3. A CI pipeline will run lint and build checks automatically. Fix any issues reported by the pipeline before merging.

## File structure (brief)

- `index.html` — app entry
- `src/` — application source (JS, CSS)
- `public/data/items-combined.json` — canonical data file (events, konst, aktorer, orgs, areas)
- `scripts/` — utility scripts (contains `scripts/validate-items.mjs`)
- `dist/` — production build output (generated)

---

If something in the validator is unclear or you need additional validation rules, open an issue or a PR and we can improve the tooling. Thanks for helping improve Huddinge Karta!
