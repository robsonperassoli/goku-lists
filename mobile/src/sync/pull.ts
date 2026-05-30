import { and, eq } from "drizzle-orm";
import type { QueryClient } from "@tanstack/react-query";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { getSync } from "@/api";
import type { ListMemberSyncData, SyncChange, SyncTable, TaskSyncData } from "@/api";
import { syncQueue } from "@/db/schema";
import type { SyncTransaction } from "@/db/sync-queue";
import { purgeListData } from "@/services/list-members";
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
  const memberListIds = new Set<string>();

  for (const change of changes) {
    if (change.table === "list") {
      listIds.add(change.id);
      continue;
    }

    if (change.table === "list_member") {
      const data = change.data as ListMemberSyncData | undefined;
      if (data?.listId) {
        memberListIds.add(data.listId);
        listIds.add(data.listId);
      }
      continue;
    }

    taskIds.add(change.id);
    const data = change.data as TaskSyncData | undefined;
    if (data?.listId) {
      listIds.add(data.listId);
    }
  }

  return { listIds, taskIds, memberListIds };
}

async function invalidateQueries(
  queryClient: QueryClient,
  changes: SyncChange[],
) {
  if (changes.length === 0) {
    return;
  }

  const { listIds, taskIds, memberListIds } = collectInvalidations(changes);

  await queryClient.invalidateQueries({ queryKey: ["lists"] });

  for (const listId of memberListIds) {
    await queryClient.invalidateQueries({ queryKey: ["listMembership", listId] });
  }

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
  options?: { currentUserId?: string },
) {
  const cursor = getCursor(db);
  const body = await getSync(cursor);
  const sorted = [...body.changes].sort((a, b) => a.updatedAt - b.updatedAt);

  const previousCursor = cursor ?? 0;
  let nextCursor = previousCursor;
  const applied: SyncChange[] = [];
  const purgedListIds = new Set<string>();

  db.transaction((tx) => {
    for (const change of sorted) {
      if (!applyChange(tx, change)) {
        continue;
      }

      applied.push(change);
      nextCursor = Math.max(nextCursor, change.updatedAt);
      clearQueueForPulledRecord(tx, change.table, change.id);

      if (
        change.table === "list_member" &&
        change.operation === "delete" &&
        options?.currentUserId
      ) {
        const data = change.data as ListMemberSyncData | undefined;
        if (data?.userId === options.currentUserId) {
          purgedListIds.add(data.listId);
        }
      }
    }
  });

  for (const listId of purgedListIds) {
    purgeListData(db, listId);
  }

  if (sorted.length === 0) {
    nextCursor = body.cursor;
  } else if (applied.length > 0) {
    nextCursor = Math.max(nextCursor, body.cursor);
  }

  setCursor(db, nextCursor);

  await invalidateQueries(queryClient, applied);
}
