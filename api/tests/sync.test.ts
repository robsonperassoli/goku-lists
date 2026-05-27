import { describe, expect, test } from "bun:test"
import { pullSync, pushSync } from "../src/sync"
import { createTestDb, OTHER_USER_ID, USER_ID } from "./helpers/setup"

describe("pullSync", () => {
  test("initial pull returns non-deleted rows owned by the user", () => {
    const db = createTestDb()
    const t1 = 1_000
    const t2 = 2_000

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: t1,
        data: { name: "Groceries", description: null, image: null },
      },
      {
        table: "task",
        id: "task-1",
        operation: "create",
        updatedAt: t2,
        data: {
          listId: "list-1",
          title: "Milk",
          notes: null,
          completedAt: null,
          dueDate: null,
          position: 0,
        },
      },
    ])

    const active = pullSync(db, USER_ID)
    expect(active.changes.map((change) => change.id).sort()).toEqual([
      "list-1",
      "task-1",
    ])
    expect(active.cursor).toBe(t2)

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "delete",
        updatedAt: 3_000,
      },
    ])

    const afterDelete = pullSync(db, USER_ID)
    expect(afterDelete.changes.map((change) => change.id)).toEqual(["task-1"])
    expect(afterDelete.cursor).toBe(t2)
  })

  test("incremental pull returns tombstones after since", () => {
    const db = createTestDb()
    const t1 = 1_000
    const t2 = 2_000
    const t3 = 3_000

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: t1,
        data: { name: "Groceries", description: null, image: null },
      },
    ])

    const initial = pullSync(db, USER_ID)
    expect(initial.changes).toHaveLength(1)
    expect(initial.cursor).toBe(t1)

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "delete",
        updatedAt: t3,
      },
    ])

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-2",
        operation: "create",
        updatedAt: t2,
        data: { name: "Chores", description: null, image: null },
      },
    ])

    const incremental = pullSync(db, USER_ID, t1)

    expect(incremental.changes.map((change) => change.id).sort()).toEqual([
      "list-1",
      "list-2",
    ])
    expect(
      incremental.changes.find((change) => change.id === "list-1")?.operation,
    ).toBe("delete")
    expect(incremental.cursor).toBe(t3)
  })

  test("pull scopes rows to the signed-in user", () => {
    const db = createTestDb()

    pushSync(db, OTHER_USER_ID, [
      {
        table: "list",
        id: "other-list",
        operation: "create",
        updatedAt: 1_000,
        data: { name: "Private", description: null, image: null },
      },
    ])

    const result = pullSync(db, USER_ID)
    expect(result.changes).toHaveLength(0)
  })

  test("incremental pull with no changes returns the same cursor", () => {
    const db = createTestDb()

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: 5_000,
        data: { name: "Groceries", description: null, image: null },
      },
    ])

    const initial = pullSync(db, USER_ID)
    const incremental = pullSync(db, USER_ID, initial.cursor)

    expect(incremental.changes).toHaveLength(0)
    expect(incremental.cursor).toBe(initial.cursor)
  })
})

describe("pushSync", () => {
  test("accepts list and task creates in order", () => {
    const db = createTestDb()

    const result = pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: 1_000,
        data: { name: "Groceries", description: null, image: null },
      },
      {
        table: "task",
        id: "task-1",
        operation: "create",
        updatedAt: 2_000,
        data: {
          listId: "list-1",
          title: "Milk",
          notes: null,
          completedAt: null,
          dueDate: null,
          position: 0,
        },
      },
    ])

    expect(result.accepted).toEqual(["list-1", "task-1"])
    expect(result.rejected).toHaveLength(0)
  })

  test("rejects stale updates with serverUpdatedAt", () => {
    const db = createTestDb()

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: 5_000,
        data: { name: "Groceries", description: null, image: null },
      },
    ])

    const result = pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "update",
        updatedAt: 4_000,
        data: { name: "Stale", description: null, image: null },
      },
    ])

    expect(result.accepted).toHaveLength(0)
    expect(result.rejected).toEqual([
      { id: "list-1", reason: "stale", serverUpdatedAt: 5_000 },
    ])
  })

  test("create on existing id applies as update when newer", () => {
    const db = createTestDb()

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: 1_000,
        data: { name: "Groceries", description: null, image: null },
      },
    ])

    const result = pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: 2_000,
        data: { name: "Updated", description: "notes", image: null },
      },
    ])

    expect(result.accepted).toEqual(["list-1"])

    const pulled = pullSync(db, USER_ID)
    const listChange = pulled.changes.find((change) => change.id === "list-1")

    expect(listChange?.data).toMatchObject({
      name: "Updated",
      description: "notes",
    })
  })

  test("rejects tasks referencing unknown or foreign lists", () => {
    const db = createTestDb()

    pushSync(db, OTHER_USER_ID, [
      {
        table: "list",
        id: "other-list",
        operation: "create",
        updatedAt: 1_000,
        data: { name: "Private", description: null, image: null },
      },
    ])

    const result = pushSync(db, USER_ID, [
      {
        table: "task",
        id: "task-1",
        operation: "create",
        updatedAt: 2_000,
        data: {
          listId: "missing-list",
          title: "Milk",
          notes: null,
          completedAt: null,
          dueDate: null,
          position: 0,
        },
      },
      {
        table: "task",
        id: "task-2",
        operation: "create",
        updatedAt: 2_000,
        data: {
          listId: "other-list",
          title: "Bread",
          notes: null,
          completedAt: null,
          dueDate: null,
          position: 0,
        },
      },
    ])

    expect(result.accepted).toHaveLength(0)
    expect(result.rejected).toEqual([
      { id: "task-1", reason: "invalid_list" },
      { id: "task-2", reason: "invalid_list" },
    ])
  })

  test("soft delete sets deletedAt when push wins LWW", () => {
    const db = createTestDb()

    pushSync(db, USER_ID, [
      {
        table: "list",
        id: "list-1",
        operation: "create",
        updatedAt: 1_000,
        data: { name: "Groceries", description: null, image: null },
      },
      {
        table: "task",
        id: "task-1",
        operation: "create",
        updatedAt: 2_000,
        data: {
          listId: "list-1",
          title: "Milk",
          notes: null,
          completedAt: null,
          dueDate: null,
          position: 0,
        },
      },
    ])

    const result = pushSync(db, USER_ID, [
      {
        table: "task",
        id: "task-1",
        operation: "delete",
        updatedAt: 3_000,
      },
    ])

    expect(result.accepted).toEqual(["task-1"])

    const incremental = pullSync(db, USER_ID, 2_000)
    const tombstone = incremental.changes.find(
      (change) => change.id === "task-1",
    )

    expect(tombstone?.operation).toBe("delete")
    expect(tombstone?.data).toMatchObject({
      deletedAt: 3_000,
    })
  })
})
