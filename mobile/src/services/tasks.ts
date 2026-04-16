import { asc, eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { task, type CreateTaskArgs, type UpdateTaskArgs } from "@/db/schema";

export function getTasks(db: ExpoSQLiteDatabase, listId: string) {
  return db
    .select()
    .from(task)
    .where(eq(task.listId, listId))
    .orderBy(asc(task.position))
    .all();
}

export function getTask(db: ExpoSQLiteDatabase, id: string) {
  return db.select().from(task).where(eq(task.id, id)).get();
}

export async function createTask(db: ExpoSQLiteDatabase, data: CreateTaskArgs) {
  const now = new Date();
  db.insert(task)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

export async function updateTask(db: ExpoSQLiteDatabase, data: UpdateTaskArgs) {
  db.update(task)
    .set({
      title: data.title,
      notes: data.notes,
      completedAt: data.completedAt ?? undefined,
      dueDate: data.dueDate ?? undefined,
      position: data.position,
      updatedAt: new Date(),
    })
    .where(eq(task.id, data.id))
    .run();
}

export async function deleteTask(db: ExpoSQLiteDatabase, id: string) {
  db.delete(task).where(eq(task.id, id)).run();
}
