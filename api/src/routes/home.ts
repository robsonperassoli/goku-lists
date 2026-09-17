import { Hono } from "hono"

import { getApkDownloadUrl } from "../lib/apk"

function downloadPage(apkUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Goku Lists</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:linear-gradient(165deg,#0A0A0A 0%,#1A1A2E 55%,#16213E 100%);color:#F5F5F7;">
  <main style="width:100%;max-width:28rem;text-align:center;">
    <h1 style="margin:0 0 8px;font-size:clamp(1.75rem,5vw,2.25rem);font-weight:700;letter-spacing:-0.02em;">Goku Lists</h1>
    <p style="margin:0 0 28px;color:#A0A0A8;font-size:1rem;line-height:1.5;">Your to-do list. Even in airplane mode.</p>
    <a href="${apkUrl}" style="display:inline-block;width:100%;max-width:18rem;box-sizing:border-box;padding:14px 24px;background:#D7FD44;color:#0A0A0A;text-decoration:none;border-radius:12px;font-weight:600;font-size:1rem;line-height:1.4;box-shadow:0 8px 24px rgba(215,253,68,0.35);">Download Android app</a>
  </main>
</body>
</html>`
}

export const homeRoutes = new Hono().get("/", (c) => {
  return c.html(downloadPage(getApkDownloadUrl()))
})
