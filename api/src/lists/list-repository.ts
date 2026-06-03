import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm"
import type { db } from "../db"
import { list } from "../db/schema"
import * as memberRepo from "./member-repository"

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
  if (!memberRepo.findActiveMemberByListAndUser(db, id, userId)) {
    return undefined
  }

  return findListById(db, id)
}

export function findAccessibleListById(
  db: Db,
  userId: string,
  id: string,
): ListRow | undefined {
  return findOwnedListById(db, userId, id)
}

export function insertList(db: Db, row: InsertListRow): void {
  db.insert(list).values(row).run()
}

export function updateListById(db: Db, id: string, patch: UpdateListRow): void {
  db.update(list).set(patch).where(eq(list.id, id)).run()
}

export function findListsByUser(
  db: Db,
  userId: string,
  query: { since?: Date; includeDeleted: boolean },
): ListRow[] {
  const listIds = memberRepo.findAccessibleListIds(db, userId)

  if (listIds.length === 0) {
    return []
  }

  const conditions = [inArray(list.id, listIds)]

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
