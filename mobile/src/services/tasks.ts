import { and, asc, eq, isNull } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { enqueue } from "@/db/sync-queue";
import { task, type CreateTaskArgs, type UpdateTaskArgs } from "@/db/schema";

export function getTasks(db: ExpoSQLiteDatabase, listId: string) {
  return db
    .select()
    .from(task)
    .where(and(eq(task.listId, listId), isNull(task.deletedAt)))
    .orderBy(asc(task.position))
    .all();
}

export function getTask(db: ExpoSQLiteDatabase, id: string) {
  return db
    .select()
    .from(task)
    .where(and(eq(task.id, id), isNull(task.deletedAt)))
    .get();
}

export async function createTask(db: ExpoSQLiteDatabase, data: CreateTaskArgs) {
  const now = new Date();
  db.transaction((tx) => {
    tx.insert(task)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    enqueue(tx, "task", data.id, "create");
  });
}

export async function updateTask(db: ExpoSQLiteDatabase, data: UpdateTaskArgs) {
  const now = new Date();
  db.transaction((tx) => {
    tx.update(task)
      .set({
        title: data.title,
        notes: data.notes,
        completedAt: data.completedAt ?? undefined,
        dueDate: data.dueDate ?? undefined,
        position: data.position,
        updatedAt: now,
      })
      .where(and(eq(task.id, data.id), isNull(task.deletedAt)))
      .run();
    enqueue(tx, "task", data.id, "update");
  });
}

export async function deleteTask(db: ExpoSQLiteDatabase, id: string) {
  const now = new Date();
  db.transaction((tx) => {
    tx.update(task)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(task.id, id), isNull(task.deletedAt)))
      .run();
    enqueue(tx, "task", id, "delete");
  });
}
