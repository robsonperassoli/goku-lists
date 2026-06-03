import type { App } from "../app"
import { config } from "../lib/config"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function downloadPage(apkUrl: string): string {
  const href = escapeHtml(apkUrl)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Goku Lists</title>
</head>
<body>
  <p><a href="${href}">Download Android app</a></p>
</body>
</html>`
}

export default (app: App) =>
  app
    .get("/", ({ set }) => {
      set.headers["content-type"] = "text/html; charset=utf-8"
      return downloadPage(config.android.apkDownloadUrl)
    })
    .get("/android/apk", ({ redirect }) =>
      redirect(config.android.apkDownloadUrl, 302),
    )
