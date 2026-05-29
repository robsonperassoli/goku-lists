import { and, eq } from "drizzle-orm";
import type { QueryClient } from "@tanstack/react-query";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { getSync } from "@/api";
import type { SyncChange, SyncTable, TaskSyncData } from "@/api";
import { syncQueue } from "@/db/schema";
import type { SyncTransaction } from "@/db/sync-queue";
import { applyChange } from "./apply-change";
import { getCursor, setCursor } from "./sync-state";

function clearQueueForPulledRecord(
  tx: SyncTransaction,
  table: SyncTable,
  recordId: string,
) {
  tx.delete(syncQueue)
    .where(
      and(eq(syncQueue.tableName, table), eq(syncQueue.recordId, recordId)),
    )
    .run();
}

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

async function invalidateQueries(
  queryClient: QueryClient,
  changes: SyncChange[],
) {
  if (changes.length === 0) {
    return;
  }

  const { listIds, taskIds } = collectInvalidations(changes);

  await queryClient.invalidateQueries({ queryKey: ["lists"] });

  for (const listId of listIds) {
    await queryClient.invalidateQueries({ queryKey: ["list", listId] });
    await queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
  }

  for (const taskId of taskIds) {
    await queryClient.invalidateQueries({ queryKey: ["task", taskId] });
  }
}

export async function pullChanges(
  db: ExpoSQLiteDatabase,
  queryClient: QueryClient,
) {
  const cursor = getCursor(db);
  const body = await getSync(cursor);
  const sorted = [...body.changes].sort((a, b) => a.updatedAt - b.updatedAt);

  const previousCursor = cursor ?? 0;
  let nextCursor = previousCursor;
  const applied: SyncChange[] = [];

  db.transaction((tx) => {
    for (const change of sorted) {
      if (!applyChange(tx, change)) {
        continue;
      }

      applied.push(change);
      nextCursor = Math.max(nextCursor, change.updatedAt);
      clearQueueForPulledRecord(tx, change.table, change.id);
    }
  });

  if (sorted.length === 0) {
    nextCursor = body.cursor;
  } else if (applied.length > 0) {
    nextCursor = Math.max(nextCursor, body.cursor);
  }

  setCursor(db, nextCursor);

  await invalidateQueries(queryClient, applied);
}
