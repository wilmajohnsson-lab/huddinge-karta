# Pre-Launch Checklist

## Legal & Attribution
- [ ] Map tile attribution visible on every map view (CARTO + OSM)
- [ ] Attribution not hidden by CSS
- [ ] Photo credits documented in CREDITS.md (photographer names filled in)
- [ ] Tile provider terms of service reviewed
- [ ] MIT license file present

## Technical
- [ ] `npm run build` completes without errors or warnings
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run validate` passes (items.json schema valid)
- [ ] `dist/` contains: index.html, assets/index.js, assets/index.css, data/items.json, favicon.svg, manifest.json, _headers, robots.txt
- [ ] No CDN dependencies except Google Fonts (Leaflet fully bundled)
- [ ] No inline script handlers in HTML (`script-src 'self'` CSP enforced)
- [ ] `VITE_TILE_URL` documented in `.env.example`

## Content
- [ ] All 13 items have valid lat/lng coordinates
- [ ] All image URLs are reachable (check Unsplash links)
- [ ] All event URLs are valid (check host websites)
- [ ] Photographer credits filled in CREDITS.md
- [ ] Date/time information is current

## UX & Accessibility
- [ ] Map loads and tiles appear on desktop and mobile
- [ ] Search, filter, and category chips work correctly
- [ ] Detail view opens and mini-map renders
- [ ] Directions sheet (Apple Maps / Google Maps) opens
- [ ] Skip link visible on keyboard focus
- [ ] All icon buttons have aria-labels
- [ ] Filter panel, search screen, detail screen have `role=dialog` + `aria-modal`
- [ ] Escape key closes open modals
- [ ] Focus returns to trigger element after modal closes
- [ ] Mobile bottom sheet drag works
- [ ] Swipe-to-dismiss active card works
- [ ] Pinch-to-zoom enabled (no `user-scalable=no`)
- [ ] Responsive: test at 375px, 768px, 1280px

## Security
- [ ] Content-Security-Policy header deployed (`script-src 'self'`)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (HSTS with preload)
- [ ] HTTPS enforced (HTTP → HTTPS redirect)
- [ ] `window.open()` uses `noopener,noreferrer`
- [ ] No secrets in git history

## CI/CD
- [ ] GitHub Actions CI passes on `dev/prepare-deploy` branch
- [ ] `deploy.yml` configured for correct branch (`main`)
- [ ] GitHub Secrets set: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`
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
