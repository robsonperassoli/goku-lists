import { createMiddleware } from "hono/factory"

import { auth } from "../lib/auth"

type SessionResult = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>

export type AuthVariables = {
  user: SessionResult["user"]
  session: SessionResult["session"]
}

export const requireAuth = createMiddleware<{
  Variables: AuthVariables
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})
