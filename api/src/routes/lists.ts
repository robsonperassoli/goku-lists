import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"

import { db } from "../db"
import { createInvitation } from "../invitations"
import { dateToMs } from "../lib/dates"
import { leaveList } from "../lists/members"
import { requireAuth, type AuthVariables } from "../middleware/auth"
import { invitationErrorStatus } from "./errors"

const listIdParamSchema = z.object({
  listId: z.string(),
})

export const listRoutes = new Hono<{ Variables: AuthVariables }>()
  .post(
    "/lists/:listId/invitations",
    requireAuth,
    zValidator("param", listIdParamSchema),
    (c) => {
      const { listId } = c.req.valid("param")
      const result = createInvitation(db, c.get("user").id, listId)

      if (!result.success) {
        return c.json(
          { error: result.error.code },
          invitationErrorStatus(result.error.code),
        )
      }

      return c.json({
        token: result.data.token,
        expiresAt: dateToMs(result.data.expiresAt),
      })
    },
  )
  .delete(
    "/lists/:listId/members/me",
    requireAuth,
    zValidator("param", listIdParamSchema),
    (c) => {
      const { listId } = c.req.valid("param")
      const now = new Date()
      const result = leaveList(db, c.get("user").id, listId, {
        updatedAt: now,
        deletedAt: now,
      })

      if (!result.success) {
        return c.json(
          { error: result.error.code },
          invitationErrorStatus(result.error.code),
        )
      }

      return c.json({ listId })
    },
  )
