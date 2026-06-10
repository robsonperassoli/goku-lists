import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { staticPlugin } from "@elysiajs/static"
import { Elysia } from "elysia"

const TEST_SECRET = "test-apk-upload-secret-32-chars!!"

describe("apk upload", () => {
  let tempRoot: string
  let publicDir: string
  let apkUploadRoutes: (app: Elysia) => Elysia
  let config: typeof import("../src/lib/config").config
  let apkFileName: string
  let previousNodeEnv: string | undefined

  beforeAll(async () => {
    previousNodeEnv = process.env.NODE_ENV
    tempRoot = mkdtempSync(join(tmpdir(), "goku-apk-upload-"))
    publicDir = join(tempRoot, "public")
    Bun.spawnSync(["mkdir", "-p", publicDir])

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
    apkUploadRoutes = (await import("../src/routes/apk-upload"))
      .default as unknown as (app: Elysia) => Elysia
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
    const app = new Elysia().use(apkUploadRoutes)

    const response = await app.handle(
      new Request("http://localhost/release", {
        method: "POST",
        body: new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      }),
    )

    expect(response.status).toBe(401)
    expect(config.public.dir).toBe(publicDir)
  })

  test("stores the uploaded apk in the public directory", async () => {
    const app = new Elysia().use(apkUploadRoutes)
    const apkBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])

    const response = await app.handle(
      new Request("http://localhost/release", {
        method: "POST",
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
        body: apkBytes,
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({
      ok: true,
      url: "https://list.goku.tools/public/goku-lists-latest.apk",
    })

    const saved = await Bun.file(join(config.public.dir, apkFileName)).bytes()
    expect(saved).toEqual(apkBytes)
  })

  test("serves apk written after startup via static plugin in production", async () => {
    process.env.NODE_ENV = "production"
    const apkBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])

    const app = new Elysia()
      .use(
        await staticPlugin({
          assets: publicDir,
          prefix: "/public",
          alwaysStatic: false,
        }),
      )
      .use(apkUploadRoutes)

    const upload = await app.handle(
      new Request("http://localhost/release", {
        method: "POST",
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
        body: apkBytes,
      }),
    )
    expect(upload.status).toBe(200)

    const download = await app.handle(
      new Request(`http://localhost/public/${apkFileName}`),
    )
    expect(download.status).toBe(200)
    expect(new Uint8Array(await download.arrayBuffer())).toEqual(apkBytes)
  })
})
