# Huddinge Karta — project instructions

## Scope and orientation

- Repository: `wilmajohnsson-lab/huddinge-karta`; public site: https://huddinge.mreh.site.
- Resolve paths from the repository root. Do not assume a particular checkout path, username, operating system, SSH alias, or that this machine is a production server.
- Start with [development setup](docs/development-setup.md) and [contribution guidance](CONTRIBUTING.md). Inspect the current branch, working tree and relevant files before changing anything; preserve unrelated work.
- This is a vanilla JavaScript/Leaflet frontend built by Vite, not a React app. Normal UI work needs no local PocketBase, Proxmox, production SSH access, or Pi extension.

## Source map

- `index.html`: application shell and control markup.
- `src/js/app.js`: map, cards, search, calendar, filters and detail views.
- `src/css/styles.css`: responsive application styles; desktop breakpoint is 720px.
- `src/js/test-helpers.js` and `test/`: helper/unit-test coverage.
- `public/data/items-combined.json`: canonical published events, art, venues, organisations and areas. `public/data/aktorlista_updated.json` is a secondary input.
- `e2e/`: Playwright tests and deterministic fixtures; read [the test contract](e2e/README.md).
- `vite.config.js`: build and PWA/service-worker behaviour.
- `deploy/` and `scripts/import_*.py`: operational/reference material, not prerequisites for UI development. Content normally comes through PocketBase's publishing workflow; do not overwrite newly published data with an old checkout.

## Setup and checks

Use the latest patched **Node.js 22** release (`.node-version`), npm and the committed lockfile.

```sh
npm ci --ignore-scripts
npm run lint
npm test -- --maxWorkers=2
npm run validate
npm run build
npm run test:e2e
```

Install Playwright Chromium separately when the development host supports it. If browser libraries are missing on a production/shared host, do not install system packages without approval; use existing GitHub CI instead. A blocked local browser test is not a passing test. Run data validation explicitly: the optional Git hook is not a substitute for the full gates.

## Change boundaries

- Keep PRs focused; avoid whole-file formatting and unrelated data/dependency changes.
- Preserve Swedish UI text, existing behaviour and both main/detail map attribution. OpenStreetMap and CARTO links must remain visible and usable wherever their maps are shown.
- Layout changes need browser checks, not just jsdom assertions: narrow/mobile/desktop widths, 719/720/721px, short landscapes, open/closed controls, keyboard focus and pointer hit targets.
- Hidden panels must not leave visible, clickable or focusable controls. Leaflet marker tests must distinguish event pins from the non-interactive user-location dot.
- When parallel work is requested, use separate worktrees and exclusive file/section ownership. Do not share mutable `node_modules`, edit another active writer's tree, or change shared Git configuration casually. Integrate and test the combined result before acceptance.
- Use direct work by default; optional subagents must have working credentials, explicit scope and durable handoffs. Never interpret a failed worker or green workflow wrapper as proof of successful implementation.

## Credentials and configuration

- `.env.example` documents `VITE_TILE_URL`; actual local configuration belongs in ignored `.env.local`. No real keys in tracked files, Git remotes, logs, screenshots, prompts or skills.
- `VITE_*` values become browser-visible build assets. Do not describe the tile key as server-secret; use appropriate domain restrictions and preserve the existing provider/style unless asked otherwise.
- Authenticate GitHub and Pi separately on a new harness. Use the operator's approved credential mechanism; do not assume a host-specific token file, switch a shared global account, or copy Pi auth/session directories by default.
- Regular local builds and fixture-based browser tests do not need production deployment credentials. Import/admin tasks require separate authorisation and access.

## CI/CD and approval

- **Validation:** `.github/workflows/ci.yml` runs branch/PR checks, including Chromium browser tests. Extend that workflow rather than creating a replacement pipeline.
- **Production:** `.github/workflows/deploy.yml` is the authoritative release path. A push to `main` automatically builds with the GitHub `VITE_TILE_URL` secret and deploys an atomic release.
- Obtain explicit approval before merging/pushing to `main`, deploying, changing repository secrets, or modifying production services/configuration. Passing CI or review is evidence, not approval.
- Do not bypass the release workflow with `scripts/deploy.sh`, direct server copies, SSH changes or another hosting provider. Deployment docs describe infrastructure; they do not authorise changes.
- Check CI against the exact PR head; for stacked PRs, document order, retarget after prerequisites merge, and recheck the new merge context. After an approved release, verify both CI and deployment plus the served site; do not infer live success from a local build.

## Portable Pi skills

The trusted project exposes two optional skills under `.pi/skills/`:

- `huddinge-layout-pr-validation`: map/control layout changes and browser/PR verification.
- `carto-raster-key-ci-deploy`: authenticated CARTO tiles and safe existing-pipeline deployment.

They need no custom memory, MCP, shell-compression or delegation extension. Keep provider/model selection and credentials in the new harness's own configuration, not in this repository.
