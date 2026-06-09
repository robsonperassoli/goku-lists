import { join } from "node:path"
import type { App } from "../app"
import { APK_FILE_NAME, config } from "../lib/config"

function isAuthorized(authorization: string | null): boolean {
  if (!authorization?.startsWith("Bearer ")) return false
  const token = authorization.slice("Bearer ".length)
  return token.length > 0 && token === config.apkUpload.secret
}

export default (app: App) =>
  app.post("/release", async ({ request, set }) => {
    if (!isAuthorized(request.headers.get("authorization"))) {
      set.status = 401
      return { error: "unauthorized" }
    }

    const body = await request.arrayBuffer()
    if (body.byteLength === 0) {
      set.status = 400
      return { error: "empty body" }
    }

    const apkPath = join(config.public.dir, APK_FILE_NAME)
    await Bun.write(apkPath, body)

    return {
      ok: true,
      url: config.android.apkDownloadUrl,
    }
  })
