# Goku Lists

A collaborative lists and tasks app. The repo has two packages: a Node/Hono API with auth and sync, and an Expo mobile client with on-device SQLite.

## Projects

### `api/`

Backend server built with [Hono](https://hono.dev) and [Zod](https://zod.dev) on Node. It handles Google sign-in ([Better Auth](https://www.better-auth.com)), persists lists and tasks in SQLite via [Drizzle](https://orm.drizzle.team), and exposes sync endpoints for the mobile app.

### `mobile/`

[Expo](https://expo.dev) app (iOS, Android, web) using Expo Router. Lists and tasks are stored locally in SQLite and can sync with the API. Auth uses the Expo Better Auth client with the `goku-lists://` deep link scheme.

Local list/task changes are recorded in a sync queue; see [`mobile/SYNC.md`](mobile/SYNC.md).

## Prerequisites

- [mise](https://mise.jdx.dev/) (installs the Node, pnpm, and Java versions in [`mise.toml`](./mise.toml))
- [ngrok](https://ngrok.com) (required for OAuth and for the phone/simulator to reach your local API)
- Android SDK at `~/Android/Sdk` (Android Studio default). [`mobile/mise.toml`](mobile/mise.toml) sets `ANDROID_HOME` when you work in `mobile/`
- Expo tooling (installed via the mobile app’s dependencies)

From the repo root:

```bash
mise install
```

## Environment

Create env files in each package (see `.gitignore` for ignored names). The API validates all variables at startup.

**API:** copy [`api/.env.example`](api/.env.example) to `api/.env.local` and fill in secrets. [Mise](https://mise.jdx.dev/) loads that file when you work in `api/` ([`api/mise.toml`](api/mise.toml)). Node and pnpm versions stay in the root [`mise.toml`](mise.toml). Railway uses service variables instead of this file.

**`api/.env.local`**

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default `3000`) |
| `FRONTEND_URL` | Public API base URL (CORS, app links; your ngrok HTTPS URL in dev) |
| `BETTER_AUTH_URL` | Better Auth base URL (defaults to `FRONTEND_URL` if unset) |
| `NGROK_DOMAIN` | Reserved ngrok domain (without `https://`) |
| `DB_FILE_NAME` | SQLite file path (e.g. `./data/db/goku.sqlite` locally, `/data/db/goku.sqlite` on Railway) |
| `PUBLIC_DIR` | Static files directory (e.g. `./data/public` locally, `/data/public` on Railway) |
| `BETTER_AUTH_SECRET` | Session signing secret (32+ characters; generate with `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `DEV_MODE` | Set to `true` for Expo dev deep links |
| `ANDROID_SHA256_CERT_FINGERPRINT` | SHA-256 signing cert fingerprint for Android App Links (see below) |
| `APK_UPLOAD_SECRET` | Bearer token for `POST /release` (32+ characters; generate with `openssl rand -base64 32`) |

Android APKs are uploaded to `{PUBLIC_DIR}` and served at `https://<your-domain>/public/goku-lists-latest.apk`.

**`mobile/.env.*.local`**

| File | Variable | Purpose |
| --- | --- | --- |
| `.env.development.local` | `EXPO_PUBLIC_API_URL` | Dev API URL (ngrok); loaded by `expo start` only |
| `.env.production.local` | `EXPO_PUBLIC_API_URL` | Production API URL; loaded by release builds only |

Do not put `EXPO_PUBLIC_API_URL` in `.env.local` — that file loads in every environment and overrides production.

## Running locally

From the repo root, work in each package with `cd api` or `cd mobile`.

1. Install dependencies in both packages: `pnpm install`
2. Migrate the API database: `pnpm db:migrate` (in `api/`)
3. Start the API: `pnpm dev` (in `api/`)
4. Expose the API with ngrok (see below)
5. Point `EXPO_PUBLIC_API_URL` and `FRONTEND_URL` at the ngrok URL, then start the app: `pnpm start` (in `mobile/`)

## ngrok

The mobile app and Google OAuth need a stable public URL to your local API. Use your reserved ngrok domain (configured as `NGROK_DOMAIN` in the API).

**Direct command** (port must match `PORT`, default 3000):

```bash
ngrok http 3000 --domain factual-worm-mostly.ngrok-free.app
```

Replace the domain with yours if different.

**Via the API package** (reads `NGROK_DOMAIN` and `PORT` from env):

```bash
cd api
pnpm ngrok
```

Set `FRONTEND_URL` and `EXPO_PUBLIC_API_URL` to `https://<your-ngrok-domain>` while developing.

### Android App Links (invite sharing)

Invite links use `https://<your-ngrok-domain>/invitations/{token}`. The app claims
those URLs via `intentFilters` in `mobile/app.json`; the API serves
`/.well-known/assetlinks.json` for domain verification.

The fingerprint in `api/.env.local` must match the certificate that **signed the APK
on the device**. If `ANDROID_SHA256_CERT_FINGERPRINT` is missing or wrong,
`assetlinks.json` has an empty `sha256_cert_fingerprints` array and invite links
hit a browser redirect instead of opening the app directly.

#### New dev install

1. Prebuild and run Android once (creates the project debug keystore):

   ```bash
   cd mobile
   npx expo prebuild
   npx expo run:android
   ```

2. Read SHA-256 from the keystore Expo/React Native uses (not
   `~/.android/debug.keystore`):

   ```bash
   keytool -list -v \
     -keystore mobile/android/app/debug.keystore \
     -alias androiddebugkey \
     -storepass android | rg SHA256
   ```

   Or from Android Studio: open `mobile/android` → Gradle → **app** →
   **android** → **signingReport** (same SHA-256 under the debug variant).

   Or:

   ```bash
   cd mobile/android && ./gradlew signingReport
   ```

3. Copy the fingerprint (colons OK) into `api/.env.local`:

   ```bash
   ANDROID_SHA256_CERT_FINGERPRINT=FA:C6:17:45:...
   ```

4. Restart the API and confirm
   `https://<your-ngrok-domain>/.well-known/assetlinks.json` lists your
   fingerprint under `com.gokulists.app`.

5. After changing `app.json` intent filters or domain, rebuild:

   ```bash
   cd mobile
   npx expo prebuild --clean
   npx expo run:android
   ```

   Re-verify on device: `adb shell pm verify-app-links --re-verify com.gokulists.app`

App Links require a native build (not Expo Go).

#### Production

Use the SHA-256 of the keystore that signs the build users install:

| How you ship | Where to get SHA-256 |
| --- | --- |
| **EAS Build** | `eas credentials -p android`, or the upload/release keystore EAS uses |
| **Local release keystore** | `keytool -list -v -keystore /path/to/release.keystore -alias YOUR_ALIAS` |
| **Google Play (Play App Signing)** | Play Console → **Setup** → **App signing** → **App signing key certificate** |

Set `ANDROID_SHA256_CERT_FINGERPRINT` on the API deployment that serves
`/.well-known/assetlinks.json` for your production domain (not only ngrok).

Until a dedicated release keystore is configured in `mobile/android`, local
release builds may still use `mobile/android/app/debug.keystore`; use that
fingerprint for those builds.

## Production Android release

From `mobile/` (Android SDK installed):

1. Create `mobile/.env.production.local` with `EXPO_PUBLIC_API_URL=https://list.goku.tools` (see env table above).
2. `pnpm prebuild` — after `app.json` changes, or the first time (generates `android/`).
3. `pnpm android:release` — builds `android/app/build/outputs/apk/release/app-release.apk`.
4. Set `GOKU_RELEASE_API_URL` and `GOKU_RELEASE_UPLOAD_SECRET` in your shell, then `pnpm android:publish` — uploads the APK.

   **413 Payload Too Large:** `list.goku.tools` is proxied through Cloudflare, which rejects POST bodies over **100 MiB** (Free/Pro). Release builds target **arm64-only** with compressed native libs to stay under that limit. If publish still fails, set `GOKU_RELEASE_API_URL` to a **DNS-only** hostname (grey cloud in Cloudflare) that points at your Railway service, e.g. `https://upload.list.goku.tools` → Railway public URL.

   Build and publish in one step: `pnpm android:publish -- --build`.

Set `ANDROID_SHA256_CERT_FINGERPRINT` on the production API (see [Railway](#railway-api) / env table above). The download page at `GET /` links to `/public/goku-lists-latest.apk`.

## Railway (API)

Production API deploy uses Railpack, SQLite on a volume at `/data`, and [`railway.json`](./railway.json). See [`RAILWAY.md`](./RAILWAY.md) for dashboard steps (root directory, volume, secrets).

## Commands

### API (`cd api`)

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server with watch |
| `pnpm start` | Start server once |
| `pnpm ngrok` | Tunnel local API through ngrok |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:generate` | Generate migrations from schema |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm lint` | Lint with oxlint |
| `pnpm lint:fix` | Lint and fix |
| `pnpm format` | Check formatting with oxfmt |
| `pnpm format:write` | Format files |
| `pnpm check` | Format check + lint |
| `pnpm check:fix` | Lint + format with fixes |
| `pnpm typecheck` | TypeScript 7 check |
| `pnpm test` | Run Vitest |

### Mobile (`cd mobile`)

| Command | Description |
| --- | --- |
| `pnpm start` | Start Expo dev server |
| `pnpm ios` | Expo dev server, open iOS |
| `pnpm android` | Expo native Android run |
| `pnpm web` | Expo dev server, open web |
| `pnpm prebuild` | Generate `android/` from Expo config |
| `pnpm android:release` | Build release APK (no install) |
| `pnpm android:publish` | Upload APK to production API |
| `pnpm lint` | ESLint via Expo |

Mobile uses pnpm for scripts (`pnpm lint`, etc.). Database migrations run at app startup via `src/db/migrate.ts`.
