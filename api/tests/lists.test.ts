import { describe, expect, test } from "bun:test"
import { createInvitation } from "../src/invitations"
import { pushSync } from "../src/sync"
import { createTestDb, USER_ID } from "./helpers/setup"

describe("lists", () => {
  test("owner can create an invitation for their list", () => {
    const db = createTestDb()

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "shared-list",
        operation: "create",
        updatedAt: 1_000,
        data: { name: "Shared", description: null, image: null },
      },
    ])

    const created = createInvitation(db, USER_ID, "shared-list")
    expect(created.success).toBe(true)

    if (created.success) {
      expect(created.data.token.length).toBeGreaterThan(0)
    }
  })
})
