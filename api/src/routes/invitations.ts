import { t } from "elysia"
import type { App } from "../app"
import { db } from "../db"
import {
  acceptInvitation,
  getInvitationPreview,
  revokeInvitation,
} from "../invitations"
import { androidIntentLink } from "../lib/app-link"
import { auth } from "../lib/auth"
import { config } from "../lib/config"
import { dateToMs } from "../lib/dates"
import { logger } from "../lib/logger"
import { invitationErrorStatus } from "./errors"

function installAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Goku Lists</title>
  </head>
  <body>
    <p>Please install Goku Lists, then open this invite link again.</p>
  </body>
</html>`
}

export default (app: App) =>
  app
    .get(
      "/invitations/:token",
      async ({ params, query, set, request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (session) {
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
        }

        const invitePath = `/invitations/${params.token}`
        const fallbackUrl = new URL(
          `${invitePath}?fallback=1`,
          config.server.frontendUrl,
        ).toString()

        set.headers["cache-control"] = "no-store"

        if (query.fallback === "1") {
          logger.info(
            `Invite app open failed (intent fallback): token=${params.token}`,
          )
          set.headers["content-type"] = "text/html; charset=utf-8"
          return installAppHtml()
        }

        set.status = 302
        set.headers.location = androidIntentLink(`invite/${params.token}`, {
          httpsFallback: fallbackUrl,
        })

        return ""
      },
      {
        params: t.Object({ token: t.String() }),
        query: t.Object({
          fallback: t.Optional(t.Literal("1")),
        }),
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
