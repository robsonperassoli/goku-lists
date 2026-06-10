import type { App } from "../app"
import { getApkDownloadUrl } from "../lib/apk"

function downloadPage(apkUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Goku Lists</title>
</head>
<body>
  <p><a href="${apkUrl}">Download Android app</a></p>
</body>
</html>`
}

export default (app: App) =>
  app.get("/", ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8"
    return downloadPage(getApkDownloadUrl())
  })
