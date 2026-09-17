import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { testClient } from "hono/testing"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import type { AppType } from "../src/app"

describe("http auth", () => {
  let tempRoot: string
  let app: AppType
  let client: ReturnType<typeof testClient<AppType>>

  beforeAll(async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "goku-auth-http-"))
    mkdirSync(join(tempRoot, "public"), { recursive: true })

    process.env.DB_FILE_NAME = join(tempRoot, "db", "goku.sqlite")
    process.env.PUBLIC_DIR = join(tempRoot, "public")
    process.env.APK_UPLOAD_SECRET = "test-apk-upload-secret-32-chars!!"
    process.env.FRONTEND_URL = "https://list.goku.tools"
    process.env.BETTER_AUTH_SECRET = "test-better-auth-secret-32-chars!"
    process.env.AUTH_GOOGLE_ID = "google-id"
    process.env.AUTH_GOOGLE_SECRET = "google-secret"
    process.env.NGROK_DOMAIN = ""
    process.env.DEV_MODE = "false"

    const appModule = await import("../src/app")
    app = appModule.app
    client = testClient(app)
  })

  afterAll(() => {
    rmSync(tempRoot, { recursive: true, force: true })
  })

  async function expectUnauthorized(res: Response) {
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: "Unauthorized" })
  }

  describe("protected routes require a session", () => {
    it("GET /sync", async () => {
      await expectUnauthorized(await client.sync.$get({ query: {} }))
    })

    it("POST /sync", async () => {
      await expectUnauthorized(
        await client.sync.$post({ json: { changes: [] } }),
      )
    })

    it("POST /lists/:listId/invitations", async () => {
      await expectUnauthorized(
        await client.lists[":listId"].invitations.$post({
          param: { listId: "list-1" },
        }),
      )
    })

    it("DELETE /lists/:listId/members/me", async () => {
      await expectUnauthorized(
        await client.lists[":listId"].members.me.$delete({
          param: { listId: "list-1" },
        }),
      )
    })

    it("POST /invitations/:token/accept", async () => {
      await expectUnauthorized(
        await client.invitations[":token"].accept.$post({
          param: { token: "token-1" },
        }),
      )
    })

    it("DELETE /invitations/:token", async () => {
      await expectUnauthorized(
        await client.invitations[":token"].$delete({
          param: { token: "token-1" },
        }),
      )
    })

    it("GET /me", async () => {
      await expectUnauthorized(await client.me.$get())
    })
  })

  describe("public routes do not require a session", () => {
    it("GET /", async () => {
      const res = await app.request("/")
      expect(res.status).toBe(200)
      expect(res.headers.get("content-type")).toMatch(/text\/html/)
    })

    it("GET /.well-known/assetlinks.json", async () => {
      const res = await app.request("/.well-known/assetlinks.json")
      expect(res.status).toBe(200)
    })

    it("GET /invitations/:token", async () => {
      const res = await client.invitations[":token"].$get({
        param: { token: "token-1" },
        query: {},
      })
      expect(res.status).toBe(302)
    })
  })
})
