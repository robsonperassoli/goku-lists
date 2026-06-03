import { and, eq } from "drizzle-orm"
import type { db } from "../db"
import { list, listInvitation, user } from "../db/schema"

type Db = typeof db
type InvitationRow = typeof listInvitation.$inferSelect

export function findInvitationById(
  db: Db,
  id: string,
): InvitationRow | undefined {
  return db.select().from(listInvitation).where(eq(listInvitation.id, id)).get()
}

export function insertInvitation(
  db: Db,
  row: typeof listInvitation.$inferInsert,
): void {
  db.insert(listInvitation).values(row).run()
}

export function updateInvitation(
  db: Db,
  id: string,
  patch: Partial<typeof listInvitation.$inferInsert>,
): void {
  db.update(listInvitation).set(patch).where(eq(listInvitation.id, id)).run()
}

export function findInvitationPreviewRow(db: Db, id: string) {
  return db
    .select({
      invitation: listInvitation,
      listName: list.name,
      inviterName: user.name,
    })
    .from(listInvitation)
    .innerJoin(list, eq(listInvitation.listId, list.id))
    .innerJoin(user, eq(listInvitation.invitedByUserId, user.id))
    .where(eq(listInvitation.id, id))
    .get()
}

export function findActiveInvitationForList(
  db: Db,
  listId: string,
  id: string,
): InvitationRow | undefined {
  return db
    .select()
    .from(listInvitation)
    .where(and(eq(listInvitation.id, id), eq(listInvitation.listId, listId)))
    .get()
}
