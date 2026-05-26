import * as Crypto from "expo-crypto";
import { and, eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";

type SyncTransaction = Parameters<
  Parameters<ExpoSQLiteDatabase["transaction"]>[0]
>[0];
import { syncQueue, type SyncOperation } from "./schema";
import { syncableTables, type SyncableTableName } from "./syncable-tables";

type CollapseResult =
  | { action: "noop" }
  | { action: "set"; operation: SyncOperation }
  | { action: "hard_delete" };

function collapseOperations(
  existing: SyncOperation,
  incoming: SyncOperation,
): CollapseResult {
  if (existing === "create" && incoming === "update") {
    return { action: "noop" };
  }
  if (existing === "create" && incoming === "delete") {
    return { action: "hard_delete" };
  }
  if (existing === "update" && incoming === "update") {
    return { action: "noop" };
  }
  if (existing === "update" && incoming === "delete") {
    return { action: "set", operation: "delete" };
  }
  return { action: "noop" };
}

export function enqueue(
  tx: SyncTransaction,
  tableName: SyncableTableName,
  recordId: string,
  operation: SyncOperation,
) {
  const existing = tx
    .select()
    .from(syncQueue)
    .where(
      and(eq(syncQueue.tableName, tableName), eq(syncQueue.recordId, recordId)),
    )
    .get();

  if (!existing) {
    tx.insert(syncQueue)
      .values({
        id: Crypto.randomUUID(),
        tableName,
        recordId,
        operation,
        createdAt: new Date(),
        attemptCount: 0,
      })
      .run();
    return;
  }

  const result = collapseOperations(
    existing.operation as SyncOperation,
    operation,
  );

  if (result.action === "hard_delete") {
    tx.delete(syncQueue).where(eq(syncQueue.id, existing.id)).run();
    const table = syncableTables[tableName];
    tx.delete(table).where(eq(table.id, recordId)).run();
    return;
  }

  if (result.action === "set") {
    tx.update(syncQueue)
      .set({ operation: result.operation })
      .where(eq(syncQueue.id, existing.id))
      .run();
  }
}

export function logSyncQueue(db: ExpoSQLiteDatabase) {
  const entries = db.select().from(syncQueue).all();
  console.log(entries);
}
