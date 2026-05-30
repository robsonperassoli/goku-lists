import { t } from "elysia"
import type { App } from "../app"
import { androidIntentLink } from "../lib/app-link"
import { config } from "../lib/config"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function inviteLandingHtml(token: string, httpsUrl: string): string {
  const androidLink = androidIntentLink(`invite/${token}`, {
    httpsFallback: httpsUrl,
  })

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Open in Goku Lists</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        max-width: 28rem;
        margin: 2rem auto;
        padding: 0 1rem;
        color: #111;
        text-align: center;
      }
      .button {
        display: inline-block;
        margin: 1rem 0;
        padding: 0.875rem 1.5rem;
        background: #2563eb;
        color: #fff;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
      }
      .hint {
        color: #666;
        font-size: 0.875rem;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <h1>Goku Lists</h1>
    <p>You were invited to collaborate on a list.</p>
    <p>
      <a class="button" href="${escapeHtml(androidLink)}">Open in Goku Lists</a>
    </p>
    <p class="hint">
      Install the app, then open this link again. If you already have it and
      nothing happens, use <strong>⋮ → Open in browser</strong> and tap the
      button.
    </p>
  </body>
</html>`
}

export default (app: App) =>
  app.get(
    "/invite/:token",
    ({ params, set }) => {
      const httpsUrl = new URL(
        `/invite/${params.token}`,
        config.server.frontendUrl,
      ).toString()

      set.headers["content-type"] = "text/html; charset=utf-8"
      set.headers["cache-control"] = "no-store"

      return inviteLandingHtml(params.token, httpsUrl)
    },
    {
      params: t.Object({ token: t.String() }),
    },
  )
