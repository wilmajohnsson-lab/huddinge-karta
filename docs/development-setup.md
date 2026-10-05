# Portable development setup

The frontend can be developed from a fresh clone on a supported workstation, VM or development container. Pi is optional: the app, tests and GitHub workflows do not depend on this project's original host or its agent extensions.

## Requirements

| Tool/access | Needed for |
| --- | --- |
| Git | Clone, branches and PR changes |
| Latest patched Node.js 22 and npm | Vite development, build, lint and tests |
| Chromium installed by Playwright and its OS libraries | Local browser tests; GitHub CI is an alternative |
| GitHub CLI (`gh`), recommended | PRs, CI logs and check monitoring |
| Repository-authorised GitHub identity | Push/PR operations; separate from Pi provider login |
| Pi with read/edit/write and shell tools, optional | Agent-assisted development |

`.node-version` selects the Node **22 major**, matching the existing workflows; it is not an exact patch pin. Use a version manager that supports this file, or select Node 22 explicitly. Pi 1.0.3 itself requires Node 22.19 or newer; consult your installed Pi version's requirements. No Pi version or provider is forced by this repo.

A POSIX shell is used in the examples and tracked Git hook. On Windows use WSL or an appropriate shell, or adapt the shell-only commands to PowerShell. No production SSH keys, Cloudflare service tokens, Proxmox CLI, local database or PocketBase server are needed for ordinary frontend work.

## Fresh clone

```sh
git clone https://github.com/wilmajohnsson-lab/huddinge-karta.git
cd huddinge-karta
node --version
npm --version
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1
```

Open the address printed by Vite (normally `http://127.0.0.1:5173`). Binding to loopback avoids exposing the dev server to the network. Port forwarding or network access is a separate, deliberate setup choice.

`npm ci --ignore-scripts` uses the committed lockfile and matches PR CI without running lifecycle scripts. To opt into the tracked pre-commit hook on a dedicated clone, run `npm run prepare`. This sets repository-local `core.hooksPath`; in linked worktrees that configuration is normally shared, so do not change it while another session owns the repo. Run the full checks below regardless of hooks.

## Local tiles and data

The app reads committed JSON from `public/data/`; no backend startup is required. Production content is normally edited in PocketBase and published back to the repository. Avoid replacing current published content with an older local snapshot.

For real CARTO basemap tiles:

1. Copy `.env.example` to `.env.local` using your shell/editor.
2. Set `VITE_TILE_URL` to the operator-approved CARTO `light_all` URL with a key valid for the development origin.
3. Restart Vite after changing it.

Do not commit the local file or print its value. All `VITE_*` values are embedded in the browser bundle and visible to visitors; domain restrictions, not secrecy in the client, limit key use. Builds can run without this local configuration, but an unkeyed basemap may show the provider's API-key watermark.

Playwright routes local fixture data and external requests, so **browser tests require no real tile key, PocketBase login or production credential**. They test layout and interaction, not live cartography. See [the fixture contract](../e2e/README.md).

## Verification

From the repository root:

```sh
npm run lint
npm test -- --maxWorkers=2
npm run validate
npm run build
npx playwright install chromium
npm run test:e2e
```

On a supported, dedicated Linux development machine, installing browser system dependencies may be appropriate after reviewing the package changes:

```sh
# Only with approval to install OS packages on this development machine:
npx playwright install --with-deps chromium
```

Do not run that command on a production/shared host without approval. If the local browser cannot launch, push the authorised feature branch and use the existing GitHub CI browser job; report local verification as blocked, not passed.

The browser runner owns a loopback Vite server on port 4173, refuses to reuse an existing server and uses at most two workers. Reports/traces are written to ignored `playwright-report/` and `test-results/` directories. CI uploads failure artifacts. Unit tests do not prove rendered geometry, and Chromium does not replace real-device Safari safe-area checks.

`npm run validate` must be run explicitly after data changes; do not rely on the optional pre-commit hook to cover every data path. Separate pre-existing warnings from failures introduced by your change.

## Start Pi in the new checkout

1. Install Pi using its supported installation method on the destination machine; no Pi installation or extensions are managed by this npm project.
2. Start `pi` from the repository root and authenticate an available provider through Pi's own login flow. Authenticate GitHub independently, using a repo-authorised identity. On shared machines, use the operator's scoped credential mechanism rather than changing a global GitHub account.
3. Review [AGENTS.md](../AGENTS.md) and `.pi/skills/` before granting project trust. `AGENTS.md` supplies the portable project instructions; trusted `.pi/skills/` supplies the two skills.
4. Confirm the startup resource list contains `huddinge-layout-pr-validation` and `carto-raster-key-ci-deploy`. Use `/reload` after changes. Explicit `/skill:<name>` invocation is available when you want to apply a skill.
5. Resolve duplicate skill-name warnings if the destination already has user-global copies; use one canonical version rather than silently retaining stale instructions.

No `.pi/settings.json`, provider/model override, MCP server or executable extension is required. Pi's project-trust decision controls resource loading; it is not an OS sandbox. Use a dedicated development account/container/VM where appropriate.

Optional additions, installed and authenticated separately after review:

- **pi-subagents** for requested parallel work with isolated worktrees. Check the destination's current agent/model configuration and provider access before launching a batch; do not copy old agent definitions or fallback-model settings blindly.
- **context-mode** for compact log/data processing. Standard shell/file tools can perform the same project work without it.
- **moving-to-new-house**, if already available, to inventory destination instructions and remove stale host assumptions. It is not required by this repo.

Do not copy the old host's global `AGENTS.md` wholesale: it may incorrectly claim the new machine is a root-operated production Proxmox node. Do not copy `auth.json`, session history, provider tokens or the entire old `.pi` directory as a default migration step.

## CI/CD stays in GitHub

Moving the development environment does not move production:

- `.github/workflows/ci.yml`: branch pushes and PRs targeting `main`; lint, unit/build checks and Chromium tests. Stacked PRs with another base still get the branch-push checks; retarget/recheck before merging to `main`.
- `.github/workflows/deploy.yml`: push to `main`; lint, unit tests, data validation, secret-configured build and atomic server release.

The GitHub repository's Actions secrets/variables remain in GitHub. The new harness does not need local copies of deployment SSH/Cloudflare credentials. It only needs authorised repository access for its intended PR operations.

**Main pushes deploy automatically.** Obtain approval before merging or pushing there. Use the existing workflow, not `scripts/deploy.sh`, direct server copies, or a new hosting provider. Infrastructure recipes in [deploy/README.md](../deploy/README.md) are not development prerequisites or permission to change production.

Verify checks on the exact PR head. After an approved merge, verify the new main commit's CI and deployment results and check the served site. Retain a rollback reference; a green build alone does not prove deployment.

## Before retiring the old environment

- Verify the new clone can build and test, and its GitHub/Pi identities have the intended access.
- Inspect `git status` on the old checkout and each worktree. Preserve uncommitted work and branches; do not delete active worktrees automatically.
- Review ignored `Source/` separately: original Excel/import material is not included in a clone. Transfer it only if needed, through an approved route.
- Review untracked notes such as `CLEANUP.md`; they are not automatically part of the repository or active instructions.
- Recreate `.env.local` through the approved configuration source. Handle any credential migration separately and never add credentials to these docs or skills.
- Do not copy `node_modules`, `dist`, browser reports or caches; regenerate them on the destination.

## Optional content-import work

Import/admin operations are separate from normal frontend development and may mutate a live service. Read the relevant scripts first and obtain approval. `scripts/import_excel.py` additionally needs Python 3, `openpyxl`, the source spreadsheet and approved `PB_URL`, `PB_EMAIL`, `PB_PASSWORD` configuration. Other import scripts have their own arguments/defaults; inspect rather than assuming they share the same environment contract. Use a virtual environment and never treat production admin credentials as ordinary frontend prerequisites.
