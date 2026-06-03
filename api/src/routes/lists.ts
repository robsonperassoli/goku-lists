import { t } from "elysia"
import type { App } from "../app"
import { db } from "../db"
import { createInvitation } from "../invitations"
import { dateToMs } from "../lib/dates"
import { leaveList } from "../lists/members"
import { invitationErrorStatus } from "./errors"

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
