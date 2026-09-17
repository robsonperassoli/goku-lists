import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

import { logger } from "./logger"

export const requestLogging = createMiddleware(async (c, next) => {
  const startedAt = performance.now()
  await next()
  const durationMs = Math.round(performance.now() - startedAt)
  logger.http(c.req.method, c.req.path, c.res.status, durationMs)
})

export function handleAppError(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    if (err.status !== 400 && err.status !== 404) {
      logger.error(
        `${c.req.method} ${c.req.path} ${err.status}: ${err.message}`,
        err,
      )
    }

    return err.getResponse()
  }

  logger.error(`${c.req.method} ${c.req.path} ERROR: ${err.message}`, err)

  return c.json({ error: err.message }, 500)
}
