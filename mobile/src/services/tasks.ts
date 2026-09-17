import { and, asc, count, eq, isNotNull, isNull } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { enqueue, runInSyncTransaction } from "@/db/sync-queue";
import { task, type CreateTaskArgs, type UpdateTaskArgs } from "@/db/schema";

export type TaskCounts = {
  listId: string;
  remaining: number;
  completed: number;
};

export function getTaskCounts(db: ExpoSQLiteDatabase): TaskCounts[] {
  const remainingRows = db
    .select({
      listId: task.listId,
      remaining: count(),
    })
    .from(task)
    .where(and(isNull(task.deletedAt), isNull(task.completedAt)))
    .groupBy(task.listId)
    .all();

  const completedRows = db
    .select({
      listId: task.listId,
      completed: count(),
    })
    .from(task)
    .where(and(isNull(task.deletedAt), isNotNull(task.completedAt)))
    .groupBy(task.listId)
    .all();

  const counts = new Map<string, TaskCounts>();

  remainingRows.forEach(({ listId, remaining }) => {
    counts.set(listId, { listId, remaining, completed: 0 });
  });

  completedRows.forEach(({ listId, completed }) => {
    const existing = counts.get(listId);
    if (existing) {
      existing.completed = completed;
    } else {
      counts.set(listId, { listId, remaining: 0, completed });
    }
  });

  return [...counts.values()];
}

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
  runInSyncTransaction(db, (tx) => {
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
  runInSyncTransaction(db, (tx) => {
    tx.update(task)
      .set({
        title: data.title,
        notes: data.notes,
        ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
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
  runInSyncTransaction(db, (tx) => {
    tx.update(task)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(task.id, id), isNull(task.deletedAt)))
      .run();
    enqueue(tx, "task", id, "delete");
  });
}
