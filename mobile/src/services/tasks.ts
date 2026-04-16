import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { task, type CreateTaskArgs, type UpdateTaskArgs } from "@/db/schema";

export async function getTasks(listId: string) {
  return db
    .select()
    .from(task)
    .where(eq(task.listId, listId))
    .orderBy(asc(task.position))
    .all();
}

export async function getTask(id: string) {
  return db.select().from(task).where(eq(task.id, id)).get();
}

export async function createTask(data: CreateTaskArgs) {
  const now = new Date();
  db.insert(task)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

export async function updateTask(data: UpdateTaskArgs) {
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

export async function deleteTask(id: string) {
  db.delete(task).where(eq(task.id, id)).run();
}
