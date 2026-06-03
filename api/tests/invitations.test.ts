import { describe, expect, test } from "bun:test"
import {
  acceptInvitation,
  createInvitation,
  getInvitationPreview,
} from "../src/invitations"
import { pullSync, pushSync } from "../src/sync"
import { createTestDb, OTHER_USER_ID, USER_ID } from "./helpers/setup"

describe("invitations", () => {
  test("invitee can preview and accept", () => {
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

    if (!created.success) {
      return
    }

    const preview = getInvitationPreview(db, created.data.token)
    expect(preview.success).toBe(true)

    if (preview.success) {
      expect(preview.data.listName).toBe("Shared")
    }

    const accepted = acceptInvitation(db, OTHER_USER_ID, created.data.token)
    expect(accepted.success).toBe(true)

    if (!accepted.success) {
      return
    }

    expect(accepted.data.listId).toBe("shared-list")

    const pull = pullSync(db, OTHER_USER_ID)
    expect(pull.changes.some((change) => change.id === "shared-list")).toBe(
      true,
    )
    expect(
      pull.changes.some(
        (change) => change.id === `shared-list:${OTHER_USER_ID}`,
      ),
    ).toBe(true)
  })
})
