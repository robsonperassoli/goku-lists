import { writeFile } from "node:fs/promises"
import { join } from "node:path"

import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"

import { getApkDownloadUrl } from "../lib/apk"
import { APK_FILE_NAME, config } from "../lib/config"

const MAX_APK_UPLOAD_BYTES = 512 * 1024 * 1024

function isAuthorized(authorization: string | undefined): boolean {
  if (!authorization?.startsWith("Bearer ")) return false
  const token = authorization.slice("Bearer ".length)
  return token.length > 0 && token === config.apkUpload.secret
}

export const apkUploadRoutes = new Hono().post(
  "/release",
  bodyLimit({
    maxSize: MAX_APK_UPLOAD_BYTES,
    onError: (c) => c.json({ error: "payload too large" }, 413),
  }),
  async (c) => {
    if (!isAuthorized(c.req.header("authorization"))) {
      return c.json({ error: "unauthorized" }, 401)
    }

    const body = await c.req.arrayBuffer()
    if (body.byteLength === 0) {
      return c.json({ error: "empty body" }, 400)
    }

    const apkPath = join(config.public.dir, APK_FILE_NAME)
    await writeFile(apkPath, Buffer.from(body))

    return c.json({
      ok: true,
      url: getApkDownloadUrl(),
    })
  },
)
