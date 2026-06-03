# Goku Lists

A collaborative lists and tasks app. The repo has two packages: a Bun/Elysia API with auth and sync, and an Expo mobile client with on-device SQLite.

## Projects

### `api/`

Backend server built with [Elysia](https://elysiajs.com) on Bun. It handles Google sign-in ([Better Auth](https://www.better-auth.com)), persists lists and tasks in SQLite via [Drizzle](https://orm.drizzle.team), and exposes sync endpoints for the mobile app.

### `mobile/`

[Expo](https://expo.dev) app (iOS, Android, web) using Expo Router. Lists and tasks are stored locally in SQLite and can sync with the API. Auth uses the Expo Better Auth client with the `goku-lists://` deep link scheme.

Local list/task changes are recorded in a sync queue; see [`mobile/SYNC.md`](mobile/SYNC.md).

## Prerequisites

- [Bun](https://bun.sh)
- [ngrok](https://ngrok.com) (required for OAuth and for the phone/simulator to reach your local API)
- Expo tooling (installed via the mobile app’s dependencies)

## Environment

Create env files in each package (see `.gitignore` for ignored names). The API validates all variables at startup.

**`api/.env`**

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default `3000`) |
| `FRONTEND_URL` | Public API base URL (your ngrok HTTPS URL in dev) |
| `NGROK_DOMAIN` | Reserved ngrok domain (without `https://`) |
| `DB_FILE_NAME` | SQLite file path (e.g. `goku.sqlite`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `DEV_MODE` | Set to `true` for Expo dev deep links |
| `ANDROID_SHA256_CERT_FINGERPRINT` | SHA-256 signing cert fingerprint for Android App Links (see below) |

**`mobile/.env`**

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Same HTTPS URL as `FRONTEND_URL` (ngrok in dev) |

## Running locally

From the repo root, work in each package with `cd api` or `cd mobile`.

1. Install dependencies in both packages: `bun install`
2. Migrate the API database: `bun run db:migrate` (in `api/`)
3. Start the API: `bun run dev` (in `api/`)
4. Expose the API with ngrok (see below)
5. Point `EXPO_PUBLIC_API_URL` and `FRONTEND_URL` at the ngrok URL, then start the app: `bun run start` (in `mobile/`)

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
bun run ngrok
```

Set `FRONTEND_URL` and `EXPO_PUBLIC_API_URL` to `https://<your-ngrok-domain>` while developing.

### Android App Links (invite sharing)

Invite links use `https://<your-ngrok-domain>/invite/{token}`. The app claims
those URLs via `intentFilters` in `mobile/app.json`; the API serves
`/.well-known/assetlinks.json` for domain verification.

The fingerprint in `api/.env` must match the certificate that **signed the APK
on the device**. If `ANDROID_SHA256_CERT_FINGERPRINT` is missing or wrong,
`assetlinks.json` has an empty `sha256_cert_fingerprints` array and invite links
open the HTML fallback instead of the app.

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

3. Copy the fingerprint (colons OK) into `api/.env`:

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

## Commands

### API (`cd api`)

| Command | Description |
| --- | --- |
| `bun run dev` | Start dev server with watch |
| `bun run start` | Start server once |
| `bun run ngrok` | Tunnel local API through ngrok |
| `bun run db:migrate` | Apply Drizzle migrations |
| `bun run db:generate` | Generate migrations from schema |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run lint` | Lint with Biome |
| `bun run lint:fix` | Lint and fix |
| `bun run format` | Check formatting |
| `bun run format:write` | Format files |
| `bun run check` | Lint + format check |
| `bun run check:fix` | Lint + format with fixes |
| `bun run typecheck` | TypeScript check |

### Mobile (`cd mobile`)

| Command | Description |
| --- | --- |
| `bun run start` | Start Expo dev server |
| `bun run ios` | Expo dev server, open iOS |
| `bun run android` | Expo dev server, open Android |
| `bun run web` | Expo dev server, open web |
| `bun run lint` | ESLint via Expo |

Mobile uses Bun for scripts (`bun run lint`, etc.). Database migrations run at app startup via `src/db/migrate.ts`.
