import { and, asc, eq, gt, isNull } from "drizzle-orm"
import type { db } from "../db"
import { list } from "../db/schema"

type Db = typeof db
type ListRow = typeof list.$inferSelect

export type InsertListRow = {
  id: string
  name: string
  description: string | null
  image: string | null
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type UpdateListRow = {
  name: string
  description: string | null
  image: string | null
  updatedAt: Date
  deletedAt: Date | null
}

export function findListById(db: Db, id: string): ListRow | undefined {
  return db.select().from(list).where(eq(list.id, id)).get()
}

export function findOwnedListById(
  db: Db,
  userId: string,
  id: string,
): ListRow | undefined {
  return db
    .select()
    .from(list)
    .where(and(eq(list.id, id), eq(list.createdByUserId, userId)))
    .get()
}

export function insertList(db: Db, row: InsertListRow): void {
  db.insert(list).values(row).run()
}

export function updateListById(
  db: Db,
  id: string,
  patch: UpdateListRow,
): void {
  db.update(list).set(patch).where(eq(list.id, id)).run()
}

export function findListsByUser(
  db: Db,
  userId: string,
  query: { since?: Date; includeDeleted: boolean },
): ListRow[] {
  const conditions = [eq(list.createdByUserId, userId)]

  if (!query.includeDeleted) {
    conditions.push(isNull(list.deletedAt))
  }

  if (query.since) {
    conditions.push(gt(list.updatedAt, query.since))
  }

  return db
    .select()
    .from(list)
    .where(and(...conditions))
    .orderBy(asc(list.updatedAt))
    .all()
}
