import type { QueryClient } from "@tanstack/react-query";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { ApiAuthError, ApiTransportError, hasAuthSession } from "@/api";
import { isOnline } from "@/lib/network";
import { pullChanges } from "./pull";
import { hasQueueRows, pushChanges } from "./push";

export type SyncDeps = {
  db: ExpoSQLiteDatabase;
  queryClient: QueryClient;
};

let deps: SyncDeps | null = null;

export function initSyncRun(syncRunDeps: SyncDeps | null) {
  deps = syncRunDeps;
}

export async function runOnce(): Promise<void> {
  if (!deps) {
    return;
  }

  if (!(await isOnline())) {
    return;
  }

  if (!hasAuthSession()) {
    return;
  }

  try {
    await pushChanges(deps.db);
    await pullChanges(deps.db, deps.queryClient);
  } catch (error) {
    if (error instanceof ApiAuthError || error instanceof ApiTransportError) {
      return;
    }

    throw error;
  }
}

export function shouldRunAgain(db: ExpoSQLiteDatabase): boolean {
  return hasQueueRows(db);
}
