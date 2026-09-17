import { Hono } from "hono"

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

export const homeRoutes = new Hono().get("/", (c) => {
  return c.html(downloadPage(getApkDownloadUrl()))
})
