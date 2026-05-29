import { setQueueChangeListener } from "@/db/sync-queue";
import { initSyncRun, runOnce, shouldRunAgain, type SyncDeps } from "./run";

export type SyncReason = "queue" | "network" | "session" | "poll";

let running = false;
let pending = false;
let activeDeps: SyncDeps | null = null;

async function runLoop() {
  running = true;

  try {
    do {
      pending = false;

      if (!activeDeps) {
        return;
      }

      await runOnce();
    } while (pending || (activeDeps ? shouldRunAgain(activeDeps.db) : false));
  } finally {
    running = false;
  }
}

export function scheduleSync(_reason?: SyncReason) {
  if (!activeDeps) {
    return;
  }

  if (running) {
    pending = true;
    return;
  }

  void runLoop();
}

export function initSyncCoordinator(deps: SyncDeps | null) {
  activeDeps = deps;
  initSyncRun(deps);

  if (!deps) {
    setQueueChangeListener(null);
    return;
  }

  setQueueChangeListener(() => {
    scheduleSync("queue");
  });
}
