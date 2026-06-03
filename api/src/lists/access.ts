import type { db } from "../db"
import type { ListMemberRole } from "../db/schema"
import * as memberRepo from "./member-repository"

type Db = typeof db

export function getActiveMemberRole(
  db: Db,
  userId: string,
  listId: string,
): ListMemberRole | null {
  const member = memberRepo.findActiveMemberByListAndUser(db, listId, userId)
  return member?.role ?? null
}

export function canAccessList(db: Db, userId: string, listId: string): boolean {
  return getActiveMemberRole(db, userId, listId) !== null
}

export function isListOwner(db: Db, userId: string, listId: string): boolean {
  return getActiveMemberRole(db, userId, listId) === "owner"
}
