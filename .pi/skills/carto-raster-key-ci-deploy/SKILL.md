---
name: carto-raster-key-ci-deploy
description: Diagnose CARTO raster API-key watermarks and configure Huddinge-karta tiles through its existing CI/CD pipeline while preserving attribution and avoiding credential leaks.
---

# CARTO configuration through existing CI/CD

## When to use

Use for a CARTO "API key required" watermark, an approved tile-key change, or verification that local/production builds receive the intended tile configuration. This skill is not permission to rotate credentials, change secrets, merge or deploy.

## Locate the project

Run `git rev-parse --show-toplevel` in the active checkout. `<repo>` below means that absolute repository root, not this skill's directory. Read `<repo>/AGENTS.md`, `<repo>/.env.example`, `<repo>/docs/development-setup.md` and the relevant current source/workflow. Do not assume a host-specific credential file, SSH alias or deployment host.

## Procedure

1. Inspect tile configuration and both map instances in `<repo>/src/js/app.js`, attribution CSS, `<repo>/vite.config.js` service-worker caches and the current deployment workflow. Compare the candidate with current main/live behaviour so old local data is not republished accidentally.
2. Establish the approved scope and credential source. Use the operator's authorised GitHub identity or scoped subprocess environment; never embed tokens in command arguments, Git remote URLs, reports or source. Do not switch a shared global login to get permissions.
3. Preserve CARTO `light_all` and its URL placeholders unless a provider/style change was requested. For approved local configuration, set the full keyed `VITE_TILE_URL` in ignored `<repo>/.env.local`; obtain approval separately before changing the repository's Actions secret of the same name. A development origin may need an approved domain restriction.
4. Preserve `VITE_TILE_URL` secret injection and the missing-key guard in `<repo>/.github/workflows/deploy.yml`. Local `.env.local` does not configure GitHub builds. Existing deployment credentials remain in GitHub; a new development harness does not need copies.
5. Keep OpenStreetMap and CARTO credits visible/clickable on both main and detail maps. Provider changes also require reviewing attribution, CSP and service-worker cache rules; escalate production configuration changes rather than applying them silently.
6. Run lint, unit tests, data validation, build and relevant browser checks. Scan the intended diff for accidental credentials without echoing their values. Fetch a representative keyed tile only within the approved task and inspect the image: HTTP 200 alone does not prove the watermark is absent. Keep full keyed URLs out of failures/logs.
7. Publish changes through the authorised PR process and existing CI. Merge to main only with explicit approval; let the existing deployment workflow publish the atomic release. Do not substitute `<repo>/scripts/deploy.sh` or direct server copies.
8. After an approved deployment, verify exact-commit CI/deploy results and served assets. Inspect standard/retina tile images as relevant, confirm attribution and data freshness, and distinguish public-site failures from origin/deployment results. Preserve a rollback reference and report incomplete checks.

## Pitfalls

- `VITE_*` values are embedded in browser assets. A GitHub secret protects configuration handling, not the key from visitors; use domain restrictions and never put server-secret credentials in frontend variables.
- Unkeyed CARTO responses can be HTTP 200 images carrying a watermark.
- Attribution enabled in JavaScript can still be hidden or obstructed by CSS.
- PWA caches can preserve old assets/tiles. Test a fresh context and inspect URLs/cache policy; do not mistake a stale browser session for a failed release.
- Fixture-based Playwright tests intentionally avoid real providers and cannot prove a key works.
- Missing local Chromium libraries do not authorise apt/system changes on a shared or production host. Use an approved development environment or existing CI.

## Verification

- No real credentials leaked to tracked source, remote URLs, logs or handoff artifacts.
- Main/detail maps preserve provider attribution and intended style.
- Local and GitHub build-time configuration are distinguished and correctly verified within the approved scope.
- The actual tile images, not just status codes, are checked when key functionality is in scope.
- Required checks and approved deployment succeed on the intended commit; public-site verification and remaining limitations are explicit.
