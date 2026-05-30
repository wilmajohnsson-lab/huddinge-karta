# GitHub secrets and variables for deploy workflow

Do NOT store private keys in this repo. Use the GitHub repository settings to add the following secrets and variables so the deploy workflow can SSH to the target host.

Secrets (Repository > Settings > Secrets & variables > Actions > Secrets):
- DEPLOY_SSH_KEY — private key (contents of ~/.ssh/huddinge-deploy-key). Keep this secret.
- DEPLOY_USER — deploy
- DEPLOY_HOST — public reachable host/IP of the-deploy-host (Actions must be able to reach this)
- DEPLOY_PATH — /var/www/huddinge-karta

Repository Variables (Settings > Secrets & variables > Actions > Variables):
- DEPLOY_PORT — 2222

Example using gh CLI (replace values appropriately):

  gh secret set DEPLOY_SSH_KEY --body "$(cat ~/.ssh/huddinge-deploy-key)"
  gh secret set DEPLOY_USER --body "deploy"
  gh secret set DEPLOY_HOST --body "your.pve-host.example"
  gh secret set DEPLOY_PATH --body "/var/www/huddinge-karta"
  gh variable set DEPLOY_PORT 2222

Remember to rotate and remove these secrets if the keys are compromised. Only add the private key for the minimal deploy user.
