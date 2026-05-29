import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import type { SyncTransaction } from "@/db/sync-queue";
import { list, task } from "@/db/schema";
import type { ListSyncData, SyncChange, TaskSyncData } from "@/api";

function shouldApply(
  localUpdatedAt: Date | undefined,
  changeUpdatedAt: number,
): boolean {
  if (!localUpdatedAt) {
    return true;
  }

  return changeUpdatedAt >= localUpdatedAt.getTime();
}

function applyListChange(tx: SyncTransaction, change: SyncChange) {
  if (change.table !== "list") {
    return;
  }

  const existing = tx
    .select()
    .from(list)
    .where(eq(list.id, change.id))
    .get();

  if (!shouldApply(existing?.updatedAt, change.updatedAt)) {
    return;
  }

  const updatedAt = new Date(change.updatedAt);

  if (change.operation === "delete") {
    const deletedAt = change.data?.deletedAt
      ? new Date(change.data.deletedAt)
      : updatedAt;

    if (existing) {
      tx.update(list)
        .set({ deletedAt, updatedAt })
        .where(eq(list.id, change.id))
        .run();
    }

    return;
  }

  const data = change.data as ListSyncData | undefined;
  if (!data) {
    return;
  }

  const values = {
    id: change.id,
    name: data.name,
    description: data.description,
    image: data.image,
    createdAt: existing?.createdAt ?? updatedAt,
    updatedAt,
    deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
  };

  if (existing) {
    tx.update(list).set(values).where(eq(list.id, change.id)).run();
    return;
  }

  tx.insert(list).values(values).run();
}

function applyTaskChange(tx: SyncTransaction, change: SyncChange) {
  if (change.table !== "task") {
    return;
  }

  const existing = tx
    .select()
    .from(task)
    .where(eq(task.id, change.id))
    .get();

  if (!shouldApply(existing?.updatedAt, change.updatedAt)) {
    return;
  }

  const updatedAt = new Date(change.updatedAt);

  if (change.operation === "delete") {
    const deletedAt = change.data?.deletedAt
      ? new Date(change.data.deletedAt)
      : updatedAt;

    if (existing) {
      tx.update(task)
        .set({ deletedAt, updatedAt })
        .where(eq(task.id, change.id))
        .run();
    }

    return;
  }

  const data = change.data as TaskSyncData | undefined;
  if (!data) {
    return;
  }

  const values = {
    id: change.id,
    listId: data.listId,
    title: data.title,
    notes: data.notes,
    completedAt: data.completedAt ? new Date(data.completedAt) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    position: data.position,
    createdAt: existing?.createdAt ?? updatedAt,
    updatedAt,
    deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
  };

  if (existing) {
    tx.update(task).set(values).where(eq(task.id, change.id)).run();
    return;
  }

  tx.insert(task).values(values).run();
}

export function applyChange(tx: SyncTransaction, change: SyncChange) {
  if (change.table === "list") {
    applyListChange(tx, change);
    return;
  }

  applyTaskChange(tx, change);
}

export function applyChanges(db: ExpoSQLiteDatabase, changes: SyncChange[]) {
  const sorted = [...changes].sort((a, b) => a.updatedAt - b.updatedAt);

  db.transaction((tx) => {
    for (const change of sorted) {
      applyChange(tx, change);
    }
  });
}
