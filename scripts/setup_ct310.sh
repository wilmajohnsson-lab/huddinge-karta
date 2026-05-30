#!/bin/bash
# scripts/setup_ct310.sh
# Prepare CT310 for deployment. DO NOT RUN automatically on production without review.
# This script contains the example commands from the project plan and must be
# executed manually by an operator on the Proxmox host after inspection.

set -euo pipefail

# Example: check if CT 310 exists
pct list | grep -E '^310\b' || pct status 310 || true

# If CT310 doesn't exist, download a Debian template and create it. Modify sizes as needed.
# pveam update
# pveam download local debian-13-standard_13.0-1_amd64.tar.zst
# pct create 310 local:vztmpl/debian-13-standard_13.0-1_amd64.tar.zst \
#   --hostname huddinge-web --cores 2 --memory 2048 \
#   --net0 name=eth0,bridge=vmbr0,ip=dhcp \
#   --rootfs local-lvm:8
# pct start 310

# Install nginx and create deploy user inside the container
# pct exec 310 -- apt-get update
# pct exec 310 -- apt-get install -y nginx
# pct exec 310 -- useradd -m -s /bin/bash deploy
# pct exec 310 -- usermod -aG sudo deploy

# Generate SSH keypair on admin machine (local):
# ssh-keygen -t ed25519 -f ~/.ssh/huddinge-deploy-key -N "" -C "huddinge-karta deploy"

# Copy public key to CT310 deploy user (example using pct push):
# pct push 310 ~/.ssh/huddinge-deploy-key.pub /root/huddinge-deploy-key.pub
# pct exec 310 -- bash -lc "mkdir -p /home/deploy/.ssh && cat /root/huddinge-deploy-key.pub >> /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys && rm /root/huddinge-deploy-key.pub"

# Create web root and set permissions
# pct exec 310 -- mkdir -p /var/www/huddinge-karta
# pct exec 310 -- chown -R deploy:deploy /var/www/huddinge-karta

# Configure nginx using deploy/nginx.conf in this repo
# pct push 310 deploy/nginx.conf /etc/nginx/sites-available/huddinge-karta.conf
# pct exec 310 -- ln -s /etc/nginx/sites-available/huddinge-karta.conf /etc/nginx/sites-enabled/huddinge-karta.conf || true
# pct exec 310 -- nginx -t
# pct exec 310 -- systemctl reload nginx

# Ensure port-forwarding from host port 2222 to CT310:22 exists (requires approval)
# CT_IP=$(pct exec 310 -- hostname -I | awk '{print $1}')
# echo "CT IP: $CT_IP"
# On the Proxmox host, with approval, run (replace <CT_IP>):
# iptables -t nat -A PREROUTING -p tcp --dport 2222 -j DNAT --to-destination <CT_IP>:22
# iptables -t nat -A POSTROUTING -p tcp -d <CT_IP> --dport 22 -j MASQUERADE
# Persist rules via iptables-persistent or nft or Proxmox firewall rules.

# Note: This script contains example commands. Review and run them manually.
