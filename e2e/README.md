# Layout browser tests

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run test:e2e
```

Do not install browser system libraries on the production Proxmox host. If Chromium
reports a missing library, run on a supported development machine or GitHub CI.
Only the GitHub runner job uses `playwright install --with-deps`.

The runner starts/stops its own Vite server at `http://127.0.0.1:4173`, refuses to
reuse an existing server, and uses at most two workers. HTML reports go to
`playwright-report/`; failure screenshots/traces and smoke screenshots go to
`test-results/`. Both directories are ignored. CI uploads failure artifacts.

## Shared fixture contract

Import `{ test, expect, selectors }` from `./support/fixtures.js` in `*.spec.js`.
The extended `page` fixture installs routes **before** each test navigates with
`await page.goto('/')`. It fixes the date at 15 June 2026 without freezing timers,
blocks service workers through the runner config, returns local JSON for both
boot endpoints, and fulfills external images with a neutral SVG. Other external
requests receive an empty 204 (including analytics). Leaflet, its CSS, local fonts,
map transforms, tiles, marker hit targets and application code remain real.
These are layout tests, not cartographic or remote-service tests.

`fixtures/items.json` supplies three events in the default Event tab:

| ID | Name | Selection |
| --- | --- | --- |
| `fixture-solo` | Fixture Solo Concert | single musik marker |
| `fixture-cluster-theatre` | Fixture Cluster Theatre | shared cluster |
| `fixture-cluster-workshop` | Fixture Cluster Workshop | shared cluster |

All dates are `15 juni`; clustered events have identical coordinates. Art and
venue collections and the secondary actor list are intentionally empty.
`art-card.spec.js` overrides only the primary data route with local artwork records
(single/clustered, outdoor/indoor and long text) to check badge placement and the
unclipped, pointer/keyboard-reachable detail button without changing this baseline.

- `selectors.singleMarker`: `.leaflet-marker-icon:has(.mpin):not(:has(.mpin-cluster-num))`
- `selectors.clusterMarker`: `.leaflet-marker-icon:has(.mpin-cluster-num)`

These exclude Leaflet's non-interactive user-location dot. Selectors are evaluated
again after clicks because active marker icons are replaced. Cards render under
`#cardScroll`; `#closeCardBtn` dismisses them. Baseline smoke only checks ordinary
single/cluster selection, not the known panel or attribution layout regressions.
A transform-hidden element can still be accessible: visibility-class checks in
smoke are not accessibility guarantees. Lane-specific specs should independently
assert geometry and accessibility behavior.
