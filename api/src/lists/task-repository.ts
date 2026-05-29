import { and, asc, eq, gt, isNull } from "drizzle-orm"
import type { db } from "../db"
import { task } from "../db/schema"

type Db = typeof db
type TaskRow = typeof task.$inferSelect

export type InsertTaskRow = {
  id: string
  listId: string
  title: string
  notes: string | null
  completedAt: Date | null
  dueDate: Date | null
  position: number
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type UpdateTaskRow = {
  listId: string
  title: string
  notes: string | null
  completedAt: Date | null
  dueDate: Date | null
  position: number
  updatedAt: Date
  deletedAt: Date | null
}

export function findTaskById(db: Db, id: string): TaskRow | undefined {
  return db.select().from(task).where(eq(task.id, id)).get()
}

export function insertTask(db: Db, row: InsertTaskRow): void {
  db.insert(task).values(row).run()
}

export function updateTaskById(
  db: Db,
  id: string,
  patch: UpdateTaskRow,
): void {
  db.update(task).set(patch).where(eq(task.id, id)).run()
}

export function findTasksByUser(
  db: Db,
  userId: string,
  query: { since?: Date; includeDeleted: boolean },
): TaskRow[] {
  const conditions = [eq(task.createdByUserId, userId)]

  if (!query.includeDeleted) {
    conditions.push(isNull(task.deletedAt))
  }

  if (query.since) {
    conditions.push(gt(task.updatedAt, query.since))
  }

  return db
    .select()
    .from(task)
    .where(and(...conditions))
    .orderBy(asc(task.updatedAt))
    .all()
}
