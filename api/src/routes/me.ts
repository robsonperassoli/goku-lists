import { Hono } from "hono"

import { requireAuth, type AuthVariables } from "../middleware/auth"

export const meRoutes = new Hono<{ Variables: AuthVariables }>().get(
  "/me",
  requireAuth,
  (c) => c.json(c.get("user")),
)
