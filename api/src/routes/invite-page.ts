import { t } from "elysia"
import type { App } from "../app"
import { androidIntentLink } from "../lib/app-link"
import { config } from "../lib/config"
import { logger } from "../lib/logger"

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
  app.get(
    "/invite/:token",
    ({ params, query, set }) => {
      const invitePath = `/invite/${params.token}`
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
