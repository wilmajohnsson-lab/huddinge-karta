## Pre-Launch Checklist

Checkbox list organised by category:

### Legal & Attribution
- [ ] Map tile attribution visible on every map view (CARTO + OSM)
- [ ] Attribution not hidden by CSS
- [ ] Photo credits documented in CREDITS.md
- [ ] Tile provider terms of service reviewed
- [ ] MIT license file present

### Technical
- [ ] npm run build completes without errors or warnings
- [ ] npm run lint passes with 0 errors
- [ ] npm run validate passes (items.json schema valid)
- [ ] dist/ contains: index.html, assets/index.js, assets/index.css, data/items.json, favicon.svg, manifest.json, _headers
- [ ] No CDN dependencies except Google Fonts (Leaflet fully bundled)
- [ ] No inline script handlers in HTML (script-src 'self' CSP enforced)
- [ ] VITE_TILE_URL documented in .env.example

### Content
- [ ] All 13 items have valid lat/lng coordinates
- [ ] All image URLs are reachable (check Unsplash links)
- [ ] All event URLs are valid (check host websites)
- [ ] Photographer credits filled in CREDITS.md
- [ ] Date/time information is current

### UX & Accessibility
- [ ] Map loads and tiles appear on desktop and mobile
- [ ] Search, filter, and category chips work correctly
- [ ] Detail view opens and mini-map renders
- [ ] Directions sheet (Apple Maps / Google Maps) opens
- [ ] Skip link visible on keyboard focus
- [ ] All icon buttons have aria-labels
- [ ] Filter panel, search screen, detail screen have role=dialog + aria-modal
- [ ] Escape key closes open modals
- [ ] Focus returns to trigger element after modal closes
- [ ] Mobile bottom sheet drag works
- [ ] Swipe-to-dismiss active card works
- [ ] Responsive: test at 375px, 768px, 1280px

### Security
- [ ] Content-Security-Policy header deployed (script-src 'self')
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] HTTPS enforced by hosting provider
- [ ] No secrets in git history

### CI/CD
- [ ] GitHub Actions CI passes on dev/prepare-deploy branch
- [ ] deploy.yml configured for correct branch (main)
- [ ] Netlify build settings verified OR GitHub Pages configured

## Deployment Options

### Option A: Netlify (recommended)
Step-by-step:
1. Push dev/prepare-deploy to GitHub
2. Merge to main via PR
3. Connect repo at app.netlify.com → Add new site → Import from Git
4. Build command: npm run build | Publish directory: dist
5. netlify.toml already configures this automatically
6. Set NODE_VERSION=22 in Netlify environment (or rely on netlify.toml)
7. Optional: set VITE_TILE_URL in Netlify environment variables if switching tile provider
8. Trigger deploy → Netlify handles HTTPS + CDN

### Option B: GitHub Pages
Step-by-step:
1. Push to main (triggers deploy.yml workflow)
2. Workflow runs: npm ci → npm run build → peaceiris/actions-gh-pages deploys dist/
3. Enable Pages in repo Settings → Pages → gh-pages branch
4. Note: _headers CSP will NOT be enforced on GitHub Pages (GitHub Pages doesn't support Netlify-style headers)
5. For CSP on GitHub Pages, use a <meta http-equiv> tag in index.html instead

## Post-Launch
- Monitor browser console for errors (first 24h)
- Check tile usage (CARTO dashboard if registered)
- Verify attribution visible on mobile and desktop
- Test sharing URLs on social media (og: tags preview)
