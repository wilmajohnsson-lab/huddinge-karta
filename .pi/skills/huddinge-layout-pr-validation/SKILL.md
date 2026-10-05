---
name: huddinge-layout-pr-validation
description: Fix and verify Huddinge-karta Leaflet attribution, card-close controls and responsive overlap using isolated PRs and existing GitHub CI, including when local Chromium cannot launch.
---

# Map layout changes and PR verification

## When to use

Use for Huddinge-karta map/control layout, hidden-panel accessibility, responsive overlap and browser regression work. This skill does not authorise merging or deploying.

## Locate the project

Run `git rev-parse --show-toplevel` from the active checkout. In this skill, `<repo>` means that absolute result, **not** the directory containing this skill. Read `<repo>/AGENTS.md`, `<repo>/docs/development-setup.md` and `<repo>/e2e/README.md`. Run npm/Git commands from `<repo>`; no fixed home directory, memory extension or custom shell tool is required.

## Procedure

1. Inspect the branch/working tree, affected markup in `<repo>/index.html`, map/card state in `<repo>/src/js/app.js`, styles in `<repo>/src/css/styles.css`, and current workflows. Keep unrelated work intact.
2. Identify the real contract: hidden vs visible, hit-testable vs merely painted, keyboard focus, viewport size and provider attribution. Reproduce with a test that can fail for that contract.
3. If parallel work was requested, assign exclusive files/sections and separate worktrees. Keep dependencies worktree-local. Require focused commits and validation handoffs, then test the combined candidate; do not launch overlapping writers just for throughput.
4. Use the fixture and selector exports from `<repo>/e2e/support/fixtures.js`. Add `*.spec.js` tests, exercising narrow/mobile/desktop widths, 719/720/721px, short landscapes, open/closed cards, resize, keyboard and actual provider-link hit targets. Preserve the detail map too.
5. Run lint, unit tests, data validation, build and focused browser tests. On a production/shared host with missing browser libraries, do not install OS packages without approval; report the local blocker and use the existing GitHub CI job on an authorised feature branch.
6. Review the actual integrated diff. Fix evidence-backed findings and rerun affected checks. If integration creates a real dependency, stack PRs and document base/merge order rather than hiding it in a mixed diff.
7. Verify the existing `<repo>/.github/workflows/ci.yml` jobs against the exact candidate SHA. Inspect failed logs and saved screenshots/traces; local command success is not remote CI evidence. Record skipped checks and remaining risks.
8. Stop before main merge/deployment unless explicitly approved. After approved prerequisite merges, retarget dependent PRs to main and verify the new merge context. Production uses only `<repo>/.github/workflows/deploy.yml`.

## Pitfalls

- The non-interactive user-location dot is also a `.leaflet-marker-icon`. Use the shared event-pin selectors; merely excluding cluster numbers can select the wrong marker.
- A focusable Leaflet marker div does not natively activate an app-specific click handler on Enter/Space. Verify keyboard behaviour rather than assuming `role="button"` supplies it.
- Translating a panel offscreen does not necessarily hide controls outside its bounds or remove them from keyboard navigation. Keep controls in bounds and verify visibility/inert state.
- Tall-screen success does not prove short-screen clearance. Wrapped credit height matters; avoid polling or per-map-movement layout reads when a size-change observer suffices.
- After resizing, a fixture marker can lie behind the header. Distinguish a test setup issue from a control defect; do not force-click through overlays and claim pointer accessibility.
- Chromium automation is not real-device Safari safe-area verification. A workflow wrapper marked complete is not proof that every child or job passed.

## Verification

- Only intended files changed; unrelated work, credentials and deployment configuration are preserved.
- Required exact-head CI and browser checks pass; data validation and the local checks are reported accurately.
- Closed controls are neither visible, clickable nor focusable; open controls are reachable.
- OpenStreetMap/CARTO links remain readable and hit-testable on every displayed map, including short/narrow layouts.
- Review findings are resolved; PR evidence and dependency order are recorded. Main stays unchanged until approval.
