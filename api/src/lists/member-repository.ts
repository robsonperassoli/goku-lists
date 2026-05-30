import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm"
import type { db } from "../db"
import { type ListMemberRole, listMember } from "../db/schema"

type Db = typeof db
type MemberRow = typeof listMember.$inferSelect

export type InsertMemberRow = {
  listId: string
  userId: string
  role: ListMemberRole
  joinedAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type UpdateMemberRow = {
  role: ListMemberRole
  updatedAt: Date
  deletedAt: Date | null
}

export function findMemberByListAndUser(
  db: Db,
  listId: string,
  userId: string,
): MemberRow | undefined {
  return db
    .select()
    .from(listMember)
    .where(and(eq(listMember.listId, listId), eq(listMember.userId, userId)))
    .get()
}

export function findActiveMemberByListAndUser(
  db: Db,
  listId: string,
  userId: string,
): MemberRow | undefined {
  return db
    .select()
    .from(listMember)
    .where(
      and(
        eq(listMember.listId, listId),
        eq(listMember.userId, userId),
        isNull(listMember.deletedAt),
      ),
    )
    .get()
}

export function insertMember(db: Db, row: InsertMemberRow): void {
  db.insert(listMember).values(row).run()
}

export function updateMemberByListAndUser(
  db: Db,
  listId: string,
  userId: string,
  patch: UpdateMemberRow,
): void {
  db.update(listMember)
    .set(patch)
    .where(and(eq(listMember.listId, listId), eq(listMember.userId, userId)))
    .run()
}

export function findAccessibleListIds(db: Db, userId: string): string[] {
  const rows = db
    .select({ listId: listMember.listId })
    .from(listMember)
    .where(and(eq(listMember.userId, userId), isNull(listMember.deletedAt)))
    .all()

  return rows.map((row) => row.listId)
}

export function findMembersForAccessibleLists(
  db: Db,
  userId: string,
  query: { since?: Date; includeDeleted: boolean },
): MemberRow[] {
  const listIds = findAccessibleListIds(db, userId)

  if (listIds.length === 0) {
    return []
  }

  const conditions = [inArray(listMember.listId, listIds)]

  if (!query.includeDeleted) {
    conditions.push(isNull(listMember.deletedAt))
  }

  if (query.since) {
    conditions.push(gt(listMember.updatedAt, query.since))
  }

  return db
    .select()
    .from(listMember)
    .where(and(...conditions))
    .orderBy(asc(listMember.updatedAt))
    .all()
}
