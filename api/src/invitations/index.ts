import { randomUUID } from "node:crypto"
import type { db } from "../db"
import { isListOwner } from "../lists/access"
import { addListMember } from "../lists/members"
import * as repo from "./repository"
import type {
  AcceptedInvitation,
  CreatedInvitation,
  InvitationError,
  InvitationPreview,
  InvitationResult,
} from "./types"
import { INVITATION_TTL_MS } from "./types"

type Db = typeof db

function ok<T>(data: T): InvitationResult<T> {
  return { success: true, data }
}

function err(error: InvitationError): InvitationResult<never> {
  return { success: false, error }
}

function isExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() <= now.getTime()
}

export function createInvitation(
  db: Db,
  userId: string,
  listId: string,
): InvitationResult<CreatedInvitation> {
  if (!isListOwner(db, userId, listId)) {
    return err({ code: "not_owner" })
  }

  const now = new Date()
  const token = randomUUID()
  const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS)

  repo.insertInvitation(db, {
    id: token,
    listId,
    invitedByUserId: userId,
    inviteeUserId: null,
    createdAt: now,
    expiresAt,
    acceptedAt: null,
    revokedAt: null,
  })

  return ok({ token, expiresAt })
}

export function getInvitationPreview(
  db: Db,
  token: string,
): InvitationResult<InvitationPreview> {
  const row = repo.findInvitationPreviewRow(db, token)

  if (!row) {
    return err({ code: "not_found" })
  }

  return ok({
    token: row.invitation.id,
    listId: row.invitation.listId,
    listName: row.listName,
    inviterName: row.inviterName,
    expiresAt: row.invitation.expiresAt,
    acceptedAt: row.invitation.acceptedAt,
    revokedAt: row.invitation.revokedAt,
  })
}

export function acceptInvitation(
  db: Db,
  userId: string,
  token: string,
): InvitationResult<AcceptedInvitation> {
  const invitation = repo.findInvitationById(db, token)

  if (!invitation) {
    return err({ code: "not_found" })
  }

  if (invitation.revokedAt) {
    return err({ code: "revoked" })
  }

  const now = new Date()

  if (isExpired(invitation.expiresAt, now)) {
    return err({ code: "expired" })
  }

  if (invitation.acceptedAt) {
    if (invitation.inviteeUserId === userId) {
      return ok({ listId: invitation.listId })
    }

    return err({ code: "already_accepted" })
  }

  const memberResult = addListMember(
    db,
    invitation.listId,
    userId,
    "contributor",
    {
      joinedAt: now,
      updatedAt: now,
    },
  )

  if (!memberResult.success) {
    return err({ code: "forbidden" })
  }

  repo.updateInvitation(db, token, {
    acceptedAt: now,
    inviteeUserId: userId,
  })

  return ok({ listId: invitation.listId })
}

export function revokeInvitation(
  db: Db,
  userId: string,
  token: string,
): InvitationResult<{ token: string }> {
  const invitation = repo.findInvitationById(db, token)

  if (!invitation) {
    return err({ code: "not_found" })
  }

  if (!isListOwner(db, userId, invitation.listId)) {
    return err({ code: "not_owner" })
  }

  if (invitation.acceptedAt) {
    return err({ code: "already_accepted" })
  }

  if (invitation.revokedAt) {
    return ok({ token })
  }

  repo.updateInvitation(db, token, {
    revokedAt: new Date(),
  })

  return ok({ token })
}

export type {
  AcceptedInvitation,
  CreatedInvitation,
  InvitationPreview,
  InvitationResult,
} from "./types"
