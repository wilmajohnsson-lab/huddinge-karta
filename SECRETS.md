# GitHub secrets and variables for deploy workflow

Do NOT store private keys in this repo. Use the GitHub repository settings to add the following secrets and variables so the deploy workflow can SSH to the target host.

Secrets (Repository > Settings > Secrets & variables > Actions > Secrets):
- DEPLOY_SSH_KEY — private key for the deploy user on the target host. Keep this secret.
- DEPLOY_PATH — absolute path on the server to deploy to (e.g. /var/www/huddinge-karta)
- VITE_TILE_URL — full CARTO tile URL including this project's API key. Required by the deployment build; use the same value in the gitignored `.env.local` for local builds. Unlike the SSH key, this value is embedded in the browser bundle and visible to visitors. Restrict the CARTO key to the project's domains; never commit it.

Repository Variables (Settings > Secrets & variables > Actions > Variables):
- DEPLOY_TUNNEL_HOST — Cloudflare Access SSH tunnel hostname (e.g. ssh-deploy.example.com)

Example using gh CLI (replace values appropriately):

  gh secret set DEPLOY_SSH_KEY --body "$(cat ~/.ssh/your-deploy-key)"
  gh secret set DEPLOY_PATH --body "/var/www/huddinge-karta"
  gh variable set DEPLOY_TUNNEL_HOST ssh-deploy.example.com

Remember to rotate and remove these secrets if the keys are compromised. Only add the private key for the minimal deploy user.
