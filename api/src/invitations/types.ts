export const INVITATION_TTL_MS = 24 * 60 * 60 * 1000

export type InvitationError =
  | { code: "not_found" }
  | { code: "not_owner" }
  | { code: "expired" }
  | { code: "revoked" }
  | { code: "already_accepted" }
  | { code: "forbidden" }

export type InvitationResult<T> =
  | { success: true; data: T }
  | { success: false; error: InvitationError }

export type InvitationPreview = {
  token: string
  listId: string
  listName: string
  inviterName: string
  expiresAt: Date
  acceptedAt: Date | null
  revokedAt: Date | null
}

export type CreatedInvitation = {
  token: string
  expiresAt: Date
}

export type AcceptedInvitation = {
  listId: string
}
