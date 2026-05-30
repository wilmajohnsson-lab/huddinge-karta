# Contributing to Huddinge Karta

Thank you for contributing! Huddinge Karta is a small single-page app (Vanilla ES modules + Vite) that shows events, culture and meeting places in Huddinge municipality on an interactive Leaflet map. Data is stored as JSON in public/data/items.json and this guide explains how to run the app locally and contribute content or code.

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

The canonical data file is `public/data/items.json`.

- Edit `public/data/items.json` to add or update organisations, areas or items.
- Run the validator before committing your changes:

```bash
npm run validate
# (If an npm script is not present you can also run:)
node scripts/validate-items.mjs
```

The validator checks structure and common mistakes (missing fields, wrong types, coordinates out of range, missing hosts/areas etc.) and will exit non-zero when there are errors.

### Field reference

| Field     | Type     | Required | Description |
|-----------|----------|----------|-------------|
| id        | integer  | yes      | Unique numeric id for the item |
| cat       | string   | yes      | Category (one of the valid cat values) |
| name      | string   | yes      | Short title shown on the map |
| desc      | string   | yes      | Short description used in popups/list |
| longDesc  | string   | yes      | Longer description for detail view |
| date      | string   | yes      | Human readable date or date range |
| time      | string   | yes      | Human readable time (e.g. "17:00–19:00") |
| loc       | string   | yes      | Name of the location (used in popups) |
| addr      | string   | yes      | Street address / place description |
| lat       | number   | yes      | Latitude (must be between 59.0 and 59.5) |
| lng       | number   | yes      | Longitude (must be between 17.5 and 18.5) |
| img       | string   | yes      | Absolute image URL (must start with `https://`) |
| url       | string   | yes      | Link to event/organisation (must start with `https://`) |
| host      | string   | yes      | Hosting organisation — must exist in top-level `orgs` array |
| area      | string   | yes      | Area id — must match one of the `areas` ids |
| free      | boolean  | yes      | true if the event/place is free of charge |

### Valid cat values

- `event`
- `konst`
- `motes`
- `musik`

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
- `public/data/items.json` — canonical content file for organisations, areas and items
- `scripts/` — utility scripts (contains `scripts/validate-items.mjs`)
- `dist/` — production build output (generated)

---

If something in the validator is unclear or you need additional validation rules, open an issue or a PR and we can improve the tooling. Thanks for helping improve Huddinge Karta!
