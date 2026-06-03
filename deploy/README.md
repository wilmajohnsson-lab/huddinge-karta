# Self-Hosted Deployment

This guide covers serving the built Vite single-page app (Huddinge Karta) from a simple static web server.

## Prerequisites
- Debian/Ubuntu server (or similar)
- A domain pointing to the server's public IP
- Ports 80 and 443 open (HTTP and HTTPS)

## Option A: nginx + certbot
1. Install required packages:

```bash
apt update
apt install nginx certbot python3-certbot-nginx -y
```

2. Copy your built `dist/` folder to the web root:

```bash
# Atomic-deploy layout: nginx/Caddy serve from `current` (a symlink) which is
# swapped atomically to releases/<sha> on every deploy.
mkdir -p /var/www/huddinge-karta/releases/initial
cp -r dist/* /var/www/huddinge-karta/releases/initial/
ln -sfn /var/www/huddinge-karta/releases/initial /var/www/huddinge-karta/current
# ensure correct ownership (optional)
chown -RH www-data:www-data /var/www/huddinge-karta
```

3. Copy this repository's nginx config to nginx sites-available:

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/huddinge-karta
ln -s /etc/nginx/sites-available/huddinge-karta /etc/nginx/sites-enabled/
```

4. Edit `/etc/nginx/sites-available/huddinge-karta` and replace `YOUR-DOMAIN.se` with your actual domain.

5. Obtain a TLS certificate with certbot (this will update your nginx config to use the certs):

```bash
certbot --nginx -d YOUR-DOMAIN.se
```

6. Test the nginx configuration and reload:

```bash
nginx -t && systemctl reload nginx
```

## Option B: Caddy (recommended — auto-HTTPS, simpler config)
1. Install Caddy: https://caddyserver.com/docs/install

2. Copy the built site to the web root:

```bash
# Atomic-deploy layout (see Option A above)
mkdir -p /var/www/huddinge-karta/releases/initial
cp -r dist/* /var/www/huddinge-karta/releases/initial/
ln -sfn /var/www/huddinge-karta/releases/initial /var/www/huddinge-karta/current
chown -RH caddy:caddy /var/www/huddinge-karta
```

3. Copy this Caddyfile to `/etc/caddy/Caddyfile` and replace `YOUR-DOMAIN.se` with your domain:

```bash
cp deploy/Caddyfile /etc/caddy/Caddyfile
```

4. Enable and start Caddy (it will obtain and renew TLS automatically):

```bash
systemctl enable --now caddy
```

## Automated deployment (GitHub Actions)
There is an example workflow at `.github/workflows/deploy.yml` (not included here). It requires these GitHub secrets:
- DEPLOY_HOST: server IP or hostname
- DEPLOY_USER: SSH username
- DEPLOY_PATH: absolute path on server (e.g. /var/www/huddinge-karta)
- DEPLOY_SSH_KEY: private SSH key (generate a dedicated deploy keypair)

To create a deploy keypair:

```bash
ssh-keygen -t ed25519 -C deploy@huddinge-karta -f ~/.ssh/huddinge_deploy
# Add the public key to the server's ~/.ssh/authorized_keys for the deploy user
# Add the private key to GitHub: Settings > Secrets > DEPLOY_SSH_KEY
```

## Proxmox LXC (if deploying on Proxmox)
Recommended: unprivileged Debian 12 LXC, 512MB RAM, 4GB disk.

```bash
# On PVE host:
pct create 200 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname huddinge-karta --memory 512 --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp --unprivileged 1
pct start 200
```

Then follow Option A or B inside the container.

## Web server after deploy
After each deployment (for example via rsync or scp) the web server does NOT need to be restarted — nginx/Caddy serve files directly from disk.

Only restart/reload the server when you change the server configuration:

```bash
# nginx:
nginx -t && systemctl reload nginx
# Caddy:
caddy validate && systemctl reload caddy
```
