import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { describe, expect, test } from "vitest"

import { pushSyncBodySchema } from "../src/sync/schemas"

describe("POST /sync validation", () => {
  const app = new Hono().post(
    "/sync",
    zValidator("json", pushSyncBodySchema),
    (c) => c.json({ ok: true }),
  )

  test("rejects unknown change tables", async () => {
    const response = await app.request("/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changes: [
          {
            table: "list_member",
            id: "m1",
            operation: "create",
            updatedAt: 1,
          },
        ],
      }),
    })

    expect(response.status).toBe(400)
  })

  test("accepts list create changes", async () => {
    const response = await app.request("/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changes: [
          {
            table: "list",
            id: "list-1",
            operation: "create",
            updatedAt: 1,
            data: { name: "Groceries", description: null, image: null },
          },
        ],
      }),
    })

    expect(response.status).toBe(200)
  })
})
