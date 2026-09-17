import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"

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
import { requireAuth, type AuthVariables } from "../middleware/auth"
import { invitationErrorStatus } from "./errors"

const tokenParamSchema = z.object({
  token: z.string(),
})

export const invitationRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/invitations/:token",
    zValidator("param", tokenParamSchema),
    zValidator(
      "query",
      z.object({
        fallback: z.literal("1").optional(),
      }),
    ),
    async (c) => {
      const { token } = c.req.valid("param")
      const { fallback } = c.req.valid("query")
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      })

      if (session) {
        const result = getInvitationPreview(db, token)

        if (!result.success) {
          return c.json(
            { error: result.error.code },
            invitationErrorStatus(result.error.code),
          )
        }

        return c.json({
          token: result.data.token,
          listId: result.data.listId,
          listName: result.data.listName,
          inviterName: result.data.inviterName,
          expiresAt: dateToMs(result.data.expiresAt),
          acceptedAt: dateToMs(result.data.acceptedAt),
          revokedAt: dateToMs(result.data.revokedAt),
        })
      }

      const invitePath = `/invitations/${token}`
      const fallbackUrl = new URL(
        `${invitePath}?fallback=1`,
        config.server.frontendUrl,
      ).toString()

      c.header("Cache-Control", "no-store")

      if (fallback === "1") {
        logger.info(`Invite app open failed (intent fallback): token=${token}`)
        return c.redirect("/", 302)
      }

      return c.redirect(
        androidIntentLink(`invite/${token}`, {
          httpsFallback: fallbackUrl,
        }),
        302,
      )
    },
  )
  .post(
    "/invitations/:token/accept",
    requireAuth,
    zValidator("param", tokenParamSchema),
    (c) => {
      const { token } = c.req.valid("param")
      const result = acceptInvitation(db, c.get("user").id, token)

      if (!result.success) {
        return c.json(
          { error: result.error.code },
          invitationErrorStatus(result.error.code),
        )
      }

      return c.json({ listId: result.data.listId })
    },
  )
  .delete(
    "/invitations/:token",
    requireAuth,
    zValidator("param", tokenParamSchema),
    (c) => {
      const { token } = c.req.valid("param")
      const result = revokeInvitation(db, c.get("user").id, token)

      if (!result.success) {
        return c.json(
          { error: result.error.code },
          invitationErrorStatus(result.error.code),
        )
      }

      return c.json({ token: result.data.token })
    },
  )
