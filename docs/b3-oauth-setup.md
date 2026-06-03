# B.3 GitHub OAuth — PocketBase setup

## Step 1 — Create GitHub OAuth App
Go to: https://github.com/organizations/wilmajohnsson-lab/settings/applications/new
(or your personal: https://github.com/settings/applications/new)

Fill in:
- Application name: Huddinge Karta Admin
- Homepage URL: https://huddinge-admin.mreh.site
- Authorization callback URL: https://huddinge-admin.mreh.site/api/oauth2-redirect

Click "Register application" → note the **Client ID**.
Click "Generate a new client secret" → note the **Client secret** (shown once).

## Step 2 — Configure in PocketBase Admin UI
Go to: https://huddinge-admin.mreh.site/_/
Login → Settings → Auth providers → GitHub

Toggle ON, paste:
- Client ID: (from step 1)
- Client secret: (from step 1)

Click Save.

## Step 3 — Verify
In Pocketbase Admin UI → Users collection → try "Sign in with GitHub".
The OAuth token will allow users to log in (for future B.1 multi-user roles).

## Notes
- The OAuth flow uses PB's built-in /api/oauth2-redirect endpoint — no custom code needed.
- For admin-only access, keep the `users` collection rule as `@request.auth.id != ""`.
- Fine-grained scope: PocketBase requests `read:user,user:email` by default — enough for auth.
