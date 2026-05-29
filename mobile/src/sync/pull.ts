import type { QueryClient } from "@tanstack/react-query";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { getSync } from "@/api";
import type { SyncChange, TaskSyncData } from "@/api";
import { applyChange } from "./apply-change";
import { getCursor, setCursor } from "./sync-state";

function collectInvalidations(changes: SyncChange[]) {
  const listIds = new Set<string>();
  const taskIds = new Set<string>();

  for (const change of changes) {
    if (change.table === "list") {
      listIds.add(change.id);
      continue;
    }

    taskIds.add(change.id);
    const data = change.data as TaskSyncData | undefined;
    if (data?.listId) {
      listIds.add(data.listId);
    }
  }

  return { listIds, taskIds };
}

function invalidateQueries(
  queryClient: QueryClient,
  changes: SyncChange[],
) {
  if (changes.length === 0) {
    return;
  }

  const { listIds, taskIds } = collectInvalidations(changes);

  queryClient.invalidateQueries({ queryKey: ["lists"] });

  for (const listId of listIds) {
    queryClient.invalidateQueries({ queryKey: ["list", listId] });
    queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
  }

  for (const taskId of taskIds) {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] });
  }
}

export async function pullChanges(
  db: ExpoSQLiteDatabase,
  queryClient: QueryClient,
) {
  const cursor = getCursor(db);
  const body = await getSync(cursor);
  const sorted = [...body.changes].sort((a, b) => a.updatedAt - b.updatedAt);

  db.transaction((tx) => {
    for (const change of sorted) {
      applyChange(tx, change);
    }

    setCursor(tx, body.cursor);
  });

  invalidateQueries(queryClient, sorted);
}
