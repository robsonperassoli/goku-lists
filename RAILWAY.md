# Railway deployment (API)

The API deploys from this monorepo with [Config as Code](https://docs.railway.com/config-as-code) in [`railway.json`](./railway.json) (Railpack builder, Bun start, SQLite on a volume).

Settings in `railway.json` override the Railway dashboard on each deploy. The dashboard is **not** updated automatically when you change the file.

## One-time project setup

1. Create a Railway project and a **goku-lists** service linked to this GitHub repo.
2. **Settings → Source → Root Directory:** `api`  
   (build and deploy commands run inside `api/`; `railway.json` stays at the repo root and is still picked up by default.)
3. **Settings → Config-as-code:** leave default (`railway.json` at repo root) or set path `/railway.json`.
4. **Volumes → Add volume** mounted at `/data` on the api service.  
   Volumes cannot be declared in `railway.json`; `deploy.requiredMountPath` only refuses deploys if `/data` is missing.

   Typical layout on the volume:

   ```
   /data
     db/goku.sqlite
     public/goku-lists-latest.apk
   ```

5. Set service **variables** (secrets stay in Railway, not in git):

| Variable | Example / notes |
| --- | --- |
| `FRONTEND_URL` | Public HTTPS URL (e.g. `https://list.goku.tools`; used for CORS and app links) |
| `BETTER_AUTH_URL` | Better Auth base URL (production: `https://list.goku.tools`) |
| `DB_FILE_NAME` | `/data/db/goku.sqlite` (must live on the volume) |
| `PUBLIC_DIR` | `/data/public` (APK uploads via `POST /release`) |
| `BETTER_AUTH_SECRET` | 32+ char secret (`openssl rand -base64 32`); keep stable across redeploys |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `DEV_MODE` | `false` |
| `NGROK_DOMAIN` | Empty string in production if unused |
| `ANDROID_SHA256_CERT_FINGERPRINT` | Optional; production signing cert for App Links |
| `APK_UPLOAD_SECRET` | Bearer token for `POST /release` (`openssl rand -base64 32`) |

`PORT` is set by Railway. After the volume is attached, `RAILWAY_VOLUME_MOUNT_PATH` is also injected (should be `/data`).

6. Point Google OAuth redirect URIs and mobile `EXPO_PUBLIC_API_URL` at your public API URL (`FRONTEND_URL` / `BETTER_AUTH_URL`).

## What `railway.json` configures

| Setting | Purpose |
| --- | --- |
| `build.builder` | `RAILPACK` |
| `build.watchPatterns` | Redeploy only when `api/**` changes |
| `deploy.requiredMountPath` | `/data` — fail fast if volume not attached |
| `deploy.startCommand` | `bun run db:migrate && bun run start` (migrations need the volume; [pre-deploy runs before the volume is mounted](https://docs.railway.com/guides/volumes)) |
| `deploy.healthcheckPath` | `/` |
| `deploy.restartPolicyType` | `ON_FAILURE` |

## CLI shortcuts

```bash
cd /path/to/goku-lists
railway link --project <name>
railway link --project artistic-benevolence --service goku-lists
railway volume add --mount-path /data
railway variable set DB_FILE_NAME=/data/db/goku.sqlite --service goku-lists
railway variable set PUBLIC_DIR=/data/public --service goku-lists
railway up --service goku-lists --detach -m "deploy api"
```

## Environment overrides

To change settings per Railway environment (e.g. staging), add an `environments` block to `railway.json` — see [config as code reference](https://docs.railway.com/config-as-code/reference#setting-environment-overrides).
