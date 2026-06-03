#!/usr/bin/env bash
# scripts/rotate-pat.sh — rotate the GitHub PAT used by the publish pipeline
# Usage: ./scripts/rotate-pat.sh <NEW_PAT>
#
# What this does:
#   1. Updates the git remote URL in this repo
#   2. Updates /etc/systemd/system/pocketbase.service.d/env.conf on CT 312
#   3. Reloads systemd + restarts pocketbase on CT 312
#   4. Verifies the service is healthy
#
# Prerequisites: run as root from the repo root on pve-core-04
# New PAT must be a GitHub fine-grained token with:
#   Repository: wilmajohnsson-lab/huddinge-karta
#   Permissions: Contents: Read and write

set -euo pipefail

NEW_PAT="${1:-}"
if [[ -z "$NEW_PAT" ]]; then
  echo "Usage: $0 <NEW_GITHUB_PAT>"
  exit 1
fi

REPO="github.com/wilmajohnsson-lab/huddinge-karta.git"
USER="wilmajohnsson-lab"

echo "==> 1/4  Updating git remote URL..."
git remote set-url origin "https://${USER}:${NEW_PAT}@${REPO}"
echo "    remote: $(git remote get-url origin | sed 's|ghp_[^@]*|***|')"

echo "==> 2/4  Patching env.conf on CT 312..."
pct exec 312 -- bash -c "
  sed -i 's|GITHUB_PAT=.*|GITHUB_PAT=${NEW_PAT}|' \
    /etc/systemd/system/pocketbase.service.d/env.conf
  chmod 600 /etc/systemd/system/pocketbase.service.d/env.conf
  echo '    env.conf updated'
"

echo "==> 3/4  Reloading systemd + restarting pocketbase on CT 312..."
pct exec 312 -- bash -c "
  systemctl daemon-reload
  systemctl restart pocketbase
  sleep 3
"

echo "==> 4/4  Health check..."
STATUS=$(pct exec 312 -- systemctl is-active pocketbase 2>&1 || true)
if [[ "$STATUS" == "active" ]]; then
  echo "    pocketbase is active ✓"
else
  echo "    WARNING: pocketbase status = $STATUS"
  pct exec 312 -- journalctl -u pocketbase -n 20 --no-pager
  exit 1
fi

# Quick publish-hook smoke test (unauthenticated ping)
HTTP=$(curl -so /dev/null -w "%{http_code}" --max-time 5 http://192.168.86.112:8090/api/health || true)
echo "    PB /api/health → HTTP $HTTP"
[[ "$HTTP" == "200" ]] && echo "    Pocketbase responding ✓" || echo "    WARNING: unexpected status $HTTP"

echo ""
echo "PAT rotation complete. Old PAT can now be revoked in GitHub → Settings → Developer settings."
