import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { Hono } from "hono"
import { afterAll, beforeAll, describe, expect, test } from "vitest"

import { servePublicAssets } from "../src/lib/public-static"

const TEST_SECRET = "test-apk-upload-secret-32-chars!!"

describe("apk upload", () => {
  let tempRoot: string
  let publicDir: string
  let apkUploadRoutes: typeof import("../src/routes/apk-upload").apkUploadRoutes
  let config: typeof import("../src/lib/config").config
  let apkFileName: string
  let previousNodeEnv: string | undefined

  beforeAll(async () => {
    previousNodeEnv = process.env.NODE_ENV
    tempRoot = mkdtempSync(join(tmpdir(), "goku-apk-upload-"))
    publicDir = join(tempRoot, "public")
    mkdirSync(publicDir, { recursive: true })

    process.env.DB_FILE_NAME = join(tempRoot, "db", "goku.sqlite")
    process.env.PUBLIC_DIR = publicDir
    process.env.APK_UPLOAD_SECRET = TEST_SECRET
    process.env.FRONTEND_URL = "https://list.goku.tools"
    process.env.BETTER_AUTH_SECRET = "test-better-auth-secret-32-chars!"
    process.env.AUTH_GOOGLE_ID = "google-id"
    process.env.AUTH_GOOGLE_SECRET = "google-secret"
    process.env.NGROK_DOMAIN = ""
    process.env.DEV_MODE = "false"

    const configModule = await import("../src/lib/config")
    config = configModule.config
    apkFileName = configModule.APK_FILE_NAME
    apkUploadRoutes = (await import("../src/routes/apk-upload")).apkUploadRoutes
  })

  afterAll(() => {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = previousNodeEnv
    }
    rmSync(tempRoot, { recursive: true, force: true })
  })

  test("rejects uploads without a valid bearer token", async () => {
    const app = new Hono().route("/", apkUploadRoutes)

    const response = await app.request("/release", {
      method: "POST",
      body: new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
    })

    expect(response.status).toBe(401)
    expect(config.public.dir).toBe(publicDir)
  })

  test("stores the uploaded apk in the public directory", async () => {
    const app = new Hono().route("/", apkUploadRoutes)
    const apkBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])

    const response = await app.request("/release", {
      method: "POST",
      headers: {
        authorization: `Bearer ${TEST_SECRET}`,
      },
      body: apkBytes,
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as { ok: boolean; url: string }
    expect(body.ok).toBe(true)
    expect(body.url).toMatch(
      /^https:\/\/list\.goku\.tools\/public\/goku-lists-latest\.apk\?v=\d+$/,
    )

    const saved = new Uint8Array(
      readFileSync(join(config.public.dir, apkFileName)),
    )
    expect(saved).toEqual(apkBytes)
  })

  test("serves apk written after startup via static middleware", async () => {
    process.env.NODE_ENV = "production"
    const apkBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])

    const app = new Hono()
      .use("/public/*", servePublicAssets(publicDir))
      .route("/", apkUploadRoutes)

    const upload = await app.request("/release", {
      method: "POST",
      headers: {
        authorization: `Bearer ${TEST_SECRET}`,
      },
      body: apkBytes,
    })
    expect(upload.status).toBe(200)

    const download = await app.request(`/public/${apkFileName}`)
    expect(download.status).toBe(200)
    expect(new Uint8Array(await download.arrayBuffer())).toEqual(apkBytes)
  })
})
