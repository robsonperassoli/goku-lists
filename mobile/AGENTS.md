use bun and bunx to run commands in this project.

use `bun run lint` to check to linting errors

## Sync queue

Whenever list or task data is created, updated, or deleted locally, the same database transaction must also update the `sync_queue` (via `enqueue` in `src/db/sync-queue.ts`). See `src/services/lists.ts` and `src/services/tasks.ts` for the pattern.

Push and pull to the server run in the background via `src/sync/` (bootstrapped by `SyncScheduler`). HTTP calls live in `src/api/`.
