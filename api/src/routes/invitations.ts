import { t } from "elysia"
import type { App } from "../app"
import { db } from "../db"
import {
  acceptInvitation,
  createInvitation,
  getInvitationPreview,
  revokeInvitation,
} from "../invitations"
import { dateToMs } from "../lib/dates"
import { leaveList } from "../lists/members"

function invitationErrorStatus(code: string): 403 | 404 | 410 | 409 {
  switch (code) {
    case "not_found":
      return 404
    case "expired":
      return 410
    case "already_accepted":
      return 409
    default:
      return 403
  }
}

export default (app: App) =>
  app
    .post(
      "/lists/:listId/invitations",
      ({ user, params, set }) => {
        const result = createInvitation(db, user.id, params.listId)

        if (!result.success) {
          set.status = invitationErrorStatus(result.error.code)
          return { error: result.error.code }
        }

        return {
          token: result.data.token,
          expiresAt: dateToMs(result.data.expiresAt),
        }
      },
      {
        auth: true,
        params: t.Object({ listId: t.String() }),
      },
    )
    .get(
      "/invitations/:token",
      ({ params, set }) => {
        const result = getInvitationPreview(db, params.token)

        if (!result.success) {
          set.status = invitationErrorStatus(result.error.code)
          return { error: result.error.code }
        }

        return {
          token: result.data.token,
          listId: result.data.listId,
          listName: result.data.listName,
          inviterName: result.data.inviterName,
          expiresAt: dateToMs(result.data.expiresAt),
          acceptedAt: dateToMs(result.data.acceptedAt),
          revokedAt: dateToMs(result.data.revokedAt),
        }
      },
      {
        params: t.Object({ token: t.String() }),
      },
    )
    .post(
      "/invitations/:token/accept",
      ({ user, params, set }) => {
        const result = acceptInvitation(db, user.id, params.token)

        if (!result.success) {
          set.status = invitationErrorStatus(result.error.code)
          return { error: result.error.code }
        }

        return { listId: result.data.listId }
      },
      {
        auth: true,
        params: t.Object({ token: t.String() }),
      },
    )
    .delete(
      "/invitations/:token",
      ({ user, params, set }) => {
        const result = revokeInvitation(db, user.id, params.token)

        if (!result.success) {
          set.status = invitationErrorStatus(result.error.code)
          return { error: result.error.code }
        }

        return { token: result.data.token }
      },
      {
        auth: true,
        params: t.Object({ token: t.String() }),
      },
    )
    .delete(
      "/lists/:listId/members/me",
      ({ user, params, set }) => {
        const now = new Date()
        const result = leaveList(db, user.id, params.listId, {
          updatedAt: now,
          deletedAt: now,
        })

        if (!result.success) {
          set.status = invitationErrorStatus(result.error.code)
          return { error: result.error.code }
        }

        return { listId: params.listId }
      },
      {
        auth: true,
        params: t.Object({ listId: t.String() }),
      },
    )
