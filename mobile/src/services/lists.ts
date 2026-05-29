import { and, asc, eq, isNull } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { enqueue, runInSyncTransaction } from "@/db/sync-queue";
import { list, type CreateListArgs, type UpdateListArgs } from "@/db/schema";

export function getLists(db: ExpoSQLiteDatabase) {
  return db
    .select()
    .from(list)
    .where(isNull(list.deletedAt))
    .orderBy(asc(list.createdAt))
    .all();
}

export function getList(db: ExpoSQLiteDatabase, id: string) {
  return db
    .select()
    .from(list)
    .where(and(eq(list.id, id), isNull(list.deletedAt)))
    .get();
}

export async function createList(db: ExpoSQLiteDatabase, data: CreateListArgs) {
  const now = new Date();
  runInSyncTransaction(db, (tx) => {
    tx.insert(list)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    enqueue(tx, "list", data.id, "create");
  });
}

export async function updateList(db: ExpoSQLiteDatabase, data: UpdateListArgs) {
  const now = new Date();
  runInSyncTransaction(db, (tx) => {
    tx.update(list)
      .set({ ...data, updatedAt: now })
      .where(and(eq(list.id, data.id), isNull(list.deletedAt)))
      .run();
    enqueue(tx, "list", data.id, "update");
  });
}

export async function deleteList(db: ExpoSQLiteDatabase, id: string) {
  const now = new Date();
  runInSyncTransaction(db, (tx) => {
    tx.update(list)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(list.id, id), isNull(list.deletedAt)))
      .run();
    enqueue(tx, "list", id, "delete");
  });
}
