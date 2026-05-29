import type { Elysia } from "elysia"
import { logger } from "./logger"

function pathFromRequest(request: Request) {
  return new URL(request.url).pathname
}

function statusFromSet(set: { status?: number | string }) {
  const status = set.status

  if (typeof status === "number") {
    return status
  }

  if (typeof status === "string") {
    return Number.parseInt(status, 10) || 500
  }

  return 200
}

export const withRequestLogging = <const Base extends Elysia>(app: Base) =>
  app
    .derive(({ request }) => ({
      requestStartedAt: performance.now(),
      requestPath: pathFromRequest(request),
      requestMethod: request.method,
    }))
    .onError(({ code, error, requestMethod, requestPath }) => {
      if (code === "VALIDATION" || code === "NOT_FOUND") {
        return
      }

      const method = requestMethod ?? "UNKNOWN"
      const path = requestPath ?? "UNKNOWN"
      const detail =
        error instanceof Error ? error.message : String(error)

      logger.error(`${method} ${path} ${String(code)}: ${detail}`, error)
    })
    .onAfterResponse(
      ({ requestMethod, requestPath, requestStartedAt, set }) => {
        const durationMs = Math.round(performance.now() - requestStartedAt)
        const status = statusFromSet(set)

        logger.http(requestMethod, requestPath, status, durationMs)
      },
    )
