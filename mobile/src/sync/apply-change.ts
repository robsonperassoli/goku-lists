import { and, eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import type { SyncTransaction } from "@/db/sync-queue";
import { list, listMember, task } from "@/db/schema";
import type {
  ListMemberSyncData,
  ListSyncData,
  SyncChange,
  TaskSyncData,
} from "@/api";

function shouldApply(
  localUpdatedAt: Date | undefined,
  changeUpdatedAt: number,
): boolean {
  if (!localUpdatedAt) {
    return true;
  }

  return changeUpdatedAt >= localUpdatedAt.getTime();
}

function applyListChange(tx: SyncTransaction, change: SyncChange): boolean {
  if (change.table !== "list") {
    return false;
  }

  const existing = tx
    .select()
    .from(list)
    .where(eq(list.id, change.id))
    .get();

  if (!shouldApply(existing?.updatedAt, change.updatedAt)) {
    return false;
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
      return true;
    }

    return false;
  }

  const data = change.data as ListSyncData | undefined;
  if (!data) {
    return false;
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
    return true;
  }

  tx.insert(list).values(values).run();
  return true;
}

function applyTaskChange(tx: SyncTransaction, change: SyncChange): boolean {
  if (change.table !== "task") {
    return false;
  }

  const existing = tx
    .select()
    .from(task)
    .where(eq(task.id, change.id))
    .get();

  if (!shouldApply(existing?.updatedAt, change.updatedAt)) {
    return false;
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
      return true;
    }

    return false;
  }

  const data = change.data as TaskSyncData | undefined;
  if (!data) {
    return false;
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
    return true;
  }

  tx.insert(task).values(values).run();
  return true;
}

function applyListMemberChange(
  tx: SyncTransaction,
  change: SyncChange,
): boolean {
  if (change.table !== "list_member") {
    return false;
  }

  const data = change.data as ListMemberSyncData | undefined;
  if (!data) {
    return false;
  }

  const existing = tx
    .select()
    .from(listMember)
    .where(
      and(
        eq(listMember.listId, data.listId),
        eq(listMember.userId, data.userId),
      ),
    )
    .get();

  if (!shouldApply(existing?.updatedAt, change.updatedAt)) {
    return false;
  }

  const updatedAt = new Date(change.updatedAt);

  if (change.operation === "delete") {
    const deletedAt = data.deletedAt
      ? new Date(data.deletedAt)
      : updatedAt;

    if (existing) {
      tx.update(listMember)
        .set({ deletedAt, updatedAt, role: data.role })
        .where(
          and(
            eq(listMember.listId, data.listId),
            eq(listMember.userId, data.userId),
          ),
        )
        .run();
      return true;
    }

    return false;
  }

  const joinedAt = existing?.joinedAt ?? updatedAt;
  const values = {
    listId: data.listId,
    userId: data.userId,
    role: data.role,
    joinedAt,
    updatedAt,
    deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
  };

  if (existing) {
    tx.update(listMember)
      .set(values)
      .where(
        and(
          eq(listMember.listId, data.listId),
          eq(listMember.userId, data.userId),
        ),
      )
      .run();
    return true;
  }

  tx.insert(listMember).values(values).run();
  return true;
}

export function applyChange(
  tx: SyncTransaction,
  change: SyncChange,
): boolean {
  if (change.table === "list") {
    return applyListChange(tx, change);
  }

  if (change.table === "list_member") {
    return applyListMemberChange(tx, change);
  }

  return applyTaskChange(tx, change);
}

export function applyChanges(db: ExpoSQLiteDatabase, changes: SyncChange[]) {
  const sorted = [...changes].sort((a, b) => a.updatedAt - b.updatedAt);

  db.transaction((tx) => {
    for (const change of sorted) {
      applyChange(tx, change);
    }
  });
}
