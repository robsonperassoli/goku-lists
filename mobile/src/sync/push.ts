import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { syncQueue } from "@/db/schema";
import type { SyncableTableName } from "@/db/syncable-tables";
import { syncableTables } from "@/db/syncable-tables";
import { ApiAuthError, postSync } from "@/api";
import type { PushResponse } from "@/api";
import { buildPushChange, orderQueueRows } from "./build-change";

type QueueRow = typeof syncQueue.$inferSelect;

export function getQueueRows(db: ExpoSQLiteDatabase): QueueRow[] {
  return orderQueueRows(db.select().from(syncQueue).all());
}

export function hasQueueRows(db: ExpoSQLiteDatabase): boolean {
  return db.select({ id: syncQueue.id }).from(syncQueue).get() != null;
}

function bumpQueueAttempts(db: ExpoSQLiteDatabase, rowIds: string[]) {
  const now = new Date();

  db.transaction((tx) => {
    for (const rowId of rowIds) {
      const row = tx
        .select()
        .from(syncQueue)
        .where(eq(syncQueue.id, rowId))
        .get();

      if (!row) {
        continue;
      }

      tx.update(syncQueue)
        .set({
          attemptCount: row.attemptCount + 1,
          attemptedAt: now,
        })
        .where(eq(syncQueue.id, rowId))
        .run();
    }
  });
}

function dequeueAccepted(db: ExpoSQLiteDatabase, recordIds: string[]) {
  db.transaction((tx) => {
    for (const recordId of recordIds) {
      tx.delete(syncQueue).where(eq(syncQueue.recordId, recordId)).run();
    }
  });
}

function handleRejectedChange(
  db: ExpoSQLiteDatabase,
  row: QueueRow,
  reason: string,
  serverUpdatedAt?: number,
) {
  if (reason !== "stale") {
    return;
  }

  db.transaction((tx) => {
    tx.delete(syncQueue).where(eq(syncQueue.id, row.id)).run();

    if (serverUpdatedAt == null) {
      return;
    }

    const tableName = row.tableName as SyncableTableName;
    const table = syncableTables[tableName];
    tx.update(table)
      .set({ updatedAt: new Date(serverUpdatedAt) })
      .where(eq(table.id, row.recordId))
      .run();
  });
}

export type PushResult =
  | { status: "empty" }
  | { status: "ok"; acceptedCount: number }
  | { status: "transport_failed" };

export async function pushChanges(db: ExpoSQLiteDatabase): Promise<PushResult> {
  const rows = getQueueRows(db);
  if (rows.length === 0) {
    return { status: "empty" };
  }

  const changes = rows
    .map((row) => buildPushChange(db, row))
    .filter((change): change is NonNullable<typeof change> => change != null);

  if (changes.length === 0) {
    return { status: "empty" };
  }

  let body: PushResponse;

  try {
    body = await postSync(changes);
  } catch (error) {
    if (error instanceof ApiAuthError) {
      throw error;
    }

    bumpQueueAttempts(
      db,
      rows.map((row) => row.id),
    );
    return { status: "transport_failed" };
  }

  if (body.accepted.length > 0) {
    dequeueAccepted(db, body.accepted);
  }

  for (const rejected of body.rejected) {
    const row = rows.find((entry) => entry.recordId === rejected.id);
    if (!row) {
      continue;
    }

    handleRejectedChange(
      db,
      row,
      rejected.reason,
      rejected.serverUpdatedAt,
    );
  }

  return { status: "ok", acceptedCount: body.accepted.length };
}
