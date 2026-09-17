use pnpm to run commands in this project.

use `pnpm lint` to check for linting errors

Android builds need `ANDROID_HOME`. Mise sets it to `~/Android/Sdk` when you work in this directory ([mise.toml](./mise.toml)). Install the SDK with Android Studio if that path does not exist.

## Sync queue

Whenever list or task data is created, updated, or deleted locally, the same database transaction must also update the `sync_queue` (via `enqueue` in `src/db/sync-queue.ts`). See `src/services/lists.ts` and `src/services/tasks.ts` for the pattern.

Push and pull to the server run in the background via `src/sync/` (bootstrapped by `SyncScheduler`). HTTP calls live in `src/api/`.

## Android App Links

Invite HTTPS links need `ANDROID_SHA256_CERT_FINGERPRINT` on the API (from the keystore that signed the installed APK). After `expo prebuild`, use `mobile/android/app/debug.keystore` — see [README § Android App Links](../README.md#android-app-links-invite-sharing).
