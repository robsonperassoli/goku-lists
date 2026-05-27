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
