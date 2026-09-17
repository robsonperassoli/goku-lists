import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { db } from "../db"
import { requireAuth, type AuthVariables } from "../middleware/auth"
import { pullSync, pushSync } from "../sync"
import { pullSyncQuerySchema, pushSyncBodySchema } from "../sync/schemas"

export const syncRoutes = new Hono<{ Variables: AuthVariables }>()
  .get("/sync", requireAuth, zValidator("query", pullSyncQuerySchema), (c) => {
    const { since } = c.req.valid("query")
    return c.json(pullSync(db, c.get("user").id, since))
  })
  .post("/sync", requireAuth, zValidator("json", pushSyncBodySchema), (c) => {
    const { changes } = c.req.valid("json")
    return c.json(pushSync(db, c.get("user").id, changes))
  })
