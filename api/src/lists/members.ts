import type { db } from "../db"
import { canAccessList, isListOwner } from "./access"
import * as listRepo from "./list-repository"
import * as memberRepo from "./member-repository"
import * as taskRepo from "./task-repository"
import type { ListMember, ListsError, ListsResult } from "./types"

type Db = typeof db
type MemberRow = ReturnType<typeof memberRepo.findMemberByListAndUser>

function ok<T>(data: T): ListsResult<T> {
  return { success: true, data }
}

function err(error: ListsError): ListsResult<never> {
  return { success: false, error }
}

function toMember(row: NonNullable<MemberRow>): ListMember {
  return {
    listId: row.listId,
    userId: row.userId,
    role: row.role,
    joinedAt: row.joinedAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

export function getListMembersForUser(
  db: Db,
  userId: string,
  query: { since?: Date; includeDeleted: boolean },
): ListMember[] {
  return memberRepo
    .findMembersForAccessibleLists(db, userId, query)
    .map(toMember)
}

export function addListMember(
  db: Db,
  listId: string,
  userId: string,
  role: "owner" | "contributor",
  timestamps: { joinedAt: Date; updatedAt: Date },
): ListsResult<ListMember> {
  const existing = memberRepo.findMemberByListAndUser(db, listId, userId)

  if (existing && !existing.deletedAt) {
    return err({ code: "forbidden" })
  }

  if (existing) {
    memberRepo.updateMemberByListAndUser(db, listId, userId, {
      role,
      updatedAt: timestamps.updatedAt,
      deletedAt: null,
    })
  } else {
    memberRepo.insertMember(db, {
      listId,
      userId,
      role,
      joinedAt: timestamps.joinedAt,
      updatedAt: timestamps.updatedAt,
      deletedAt: null,
    })
  }

  return ok(toMember(memberRepo.findMemberByListAndUser(db, listId, userId)!))
}

export function removeListMember(
  db: Db,
  actorUserId: string,
  listId: string,
  targetUserId: string,
  timestamps: { updatedAt: Date; deletedAt: Date },
): ListsResult<ListMember> {
  if (!isListOwner(db, actorUserId, listId)) {
    return err({ code: "not_owner" })
  }

  if (actorUserId === targetUserId) {
    return err({ code: "forbidden" })
  }

  const existing = memberRepo.findActiveMemberByListAndUser(
    db,
    listId,
    targetUserId,
  )

  if (!existing) {
    return err({ code: "not_found" })
  }

  memberRepo.updateMemberByListAndUser(db, listId, targetUserId, {
    role: existing.role,
    updatedAt: timestamps.updatedAt,
    deletedAt: timestamps.deletedAt,
  })

  return ok(
    toMember(memberRepo.findMemberByListAndUser(db, listId, targetUserId)!),
  )
}

export function leaveList(
  db: Db,
  userId: string,
  listId: string,
  timestamps: { updatedAt: Date; deletedAt: Date },
): ListsResult<ListMember> {
  const role = memberRepo.findActiveMemberByListAndUser(db, listId, userId)

  if (!role) {
    return err({ code: "not_member" })
  }

  if (role.role === "owner") {
    return err({ code: "forbidden" })
  }

  memberRepo.updateMemberByListAndUser(db, listId, userId, {
    role: role.role,
    updatedAt: timestamps.updatedAt,
    deletedAt: timestamps.deletedAt,
  })

  return ok(toMember(memberRepo.findMemberByListAndUser(db, listId, userId)!))
}

export function canUserAccessList(db: Db, userId: string, listId: string) {
  return canAccessList(db, userId, listId)
}

export function isUserListOwner(db: Db, userId: string, listId: string) {
  return isListOwner(db, userId, listId)
}
