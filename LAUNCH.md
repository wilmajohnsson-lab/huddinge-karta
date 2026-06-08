# Pre-Launch Checklist

## Legal & Attribution
- [x] Map tile attribution visible on every map view (CARTO + OSM)
- [x] Attribution not hidden by CSS
- [x] Photo credits documented in CREDITS.md (photographer names filled in)
- [x] Tile provider terms of service reviewed
- [x] MIT license file present

## Technical
- [x] `npm run build` completes without errors or warnings
- [x] `npm run lint` passes with 0 errors
- [x] `npm run validate` passes (items-combined.json schema valid)
- [x] `dist/` contains: index.html, assets/index.js, assets/index.css, data/items-combined.json, favicon.svg, manifest.json, _headers, robots.txt
- [x] No CDN dependencies except Google Fonts (Leaflet fully bundled)
- [x] No inline script handlers in HTML (`script-src 'self'` CSP enforced)
- [x] `VITE_TILE_URL` documented in `.env.example`

## Content
- [ ] All items have valid lat/lng coordinates
- [x] All image URLs are reachable (check Unsplash links)
- [x] All event URLs are valid (check host websites)
- [x] Photographer credits filled in CREDITS.md
- [ ] Date/time information is current

## UX & Accessibility
- [x] Map loads and tiles appear on desktop and mobile
- [x] Search, filter, and category chips work correctly
- [x] Detail view opens and mini-map renders
- [x] Directions sheet (Apple Maps / Google Maps) opens
- [x] Skip link visible on keyboard focus
- [x] All icon buttons have aria-labels
- [x] Filter panel, search screen, detail screen have `role=dialog` + `aria-modal`
- [x] Escape key closes open modals
- [x] Focus returns to trigger element after modal closes
- [ ] Mobile bottom sheet drag works
- [ ] Swipe-to-dismiss active card works
- [x] Pinch-to-zoom enabled (no `user-scalable=no`)
- [ ] Responsive: test at 375px, 768px, 1280px

## Security
- [x] Content-Security-Policy header deployed (`script-src 'self'`)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Strict-Transport-Security (HSTS with preload)
- [x] HTTPS enforced (HTTP → HTTPS redirect)
- [x] `window.open()` uses `noopener,noreferrer`
- [x] No secrets in git history

## CI/CD
- [x] GitHub Actions CI passes on `dev/prepare-deploy` branch
- [x] `deploy.yml` configured for correct branch (`main`)
- [ ] GitHub Secrets set: `DEPLOY_SSH_KEY`, `DEPLOY_PATH`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`; Variable: `DEPLOY_TUNNEL_HOST`
- [ ] Manual deploy tested: `DEPLOY_HOST=... ./scripts/deploy.sh --dry-run`

---

## Deployment: Self-Hosted (nginx or Caddy)

Full guide: [`deploy/README.md`](deploy/README.md)

### Quick Start

1. **Provision server** — Debian 12, 512 MB RAM, ports 80/443 open  
   (Proxmox LXC works well — see `deploy/README.md` for `pct create` snippet)

2. **Install web server:**
   ```bash
   # Option A: nginx + certbot
   apt install nginx certbot python3-certbot-nginx -y
   cp deploy/nginx.conf /etc/nginx/sites-available/huddinge-karta
   ln -s /etc/nginx/sites-available/huddinge-karta /etc/nginx/sites-enabled/
   # Edit: replace YOUR-DOMAIN.se with actual domain
   certbot --nginx -d YOUR-DOMAIN.se
   nginx -t && systemctl reload nginx

   # Option B: Caddy (recommended — auto-HTTPS)
   # Install: https://caddyserver.com/docs/install
   cp deploy/Caddyfile /etc/caddy/Caddyfile
   # Edit: replace YOUR-DOMAIN.se with actual domain
   systemctl enable --now caddy
   ```

3. **Deploy the site:**
   ```bash
   # Manual (from dev machine):
   DEPLOY_HOST=your-server.se ./scripts/deploy.sh

   # Automated (push to main → GitHub Actions → rsync):
   git checkout main && git merge dev/prepare-deploy && git push
   ```

4. **Verify:**
   - [ ] Site loads over HTTPS
   - [ ] Security headers present (`curl -I https://YOUR-DOMAIN.se`)
   - [ ] CSP active (check browser DevTools → Console for violations)
   - [ ] All map tiles load
   - [ ] Mobile layout works

### Alternative: Netlify (staging/preview only)

`netlify.toml` is kept as a convenience for quick preview environments.  
Connect the repo in the Netlify dashboard — build/publish already configured.  
Note: for production, use the self-hosted configs which enforce full security headers.

---

## Post-Launch

- [ ] Monitor browser console for errors (first 72h)
- [ ] Check tile usage (CARTO dashboard if registered)
- [ ] Verify attribution visible on mobile and desktop
- [ ] Test sharing URLs on social media (og: tags preview)
- [ ] Tag release: `git tag v1.0.0 && git push --tags`
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Uptime Kuma)
