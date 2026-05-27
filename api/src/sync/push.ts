import { and, eq } from "drizzle-orm"
import type { db } from "../db"
import { list, task } from "../db/schema"
import { dateToMs, isStale, msToDate, optionalMsToDate } from "../lib/dates"
import type { PushChange, PushResponse, RejectedChange } from "./types"

type Db = typeof db

type ApplyResult =
  | { ok: true }
  | { ok: false; reason: string; serverUpdatedAt?: number }

function ownedList(
  db: Db,
  userId: string,
  listId: string,
): typeof list.$inferSelect | undefined {
  return db
    .select()
    .from(list)
    .where(and(eq(list.id, listId), eq(list.createdByUserId, userId)))
    .get()
}

function reject(
  id: string,
  reason: string,
  serverUpdatedAt?: number,
): RejectedChange {
  return { id, reason, serverUpdatedAt }
}

type ListPushChange = Extract<PushChange, { table: "list" }>
type TaskPushChange = Extract<PushChange, { table: "task" }>

function applyListChange(
  db: Db,
  userId: string,
  change: ListPushChange,
): ApplyResult {
  const existing = db.select().from(list).where(eq(list.id, change.id)).get()
  const updatedAt = msToDate(change.updatedAt)

  if (change.operation === "delete") {
    if (!existing) {
      return { ok: false, reason: "not_found" }
    }
    if (existing.createdByUserId !== userId) {
      return { ok: false, reason: "not_owner" }
    }
    if (isStale(existing.updatedAt, change.updatedAt)) {
      return {
        ok: false,
        reason: "stale",
        serverUpdatedAt: dateToMs(existing.updatedAt) ?? undefined,
      }
    }

    db.update(list)
      .set({ deletedAt: updatedAt, updatedAt })
      .where(eq(list.id, change.id))
      .run()

    return { ok: true }
  }

  const data = change.data

  if (!existing) {
    db.insert(list)
      .values({
        id: change.id,
        name: data.name,
        description: data.description,
        image: data.image,
        createdByUserId: userId,
        createdAt: updatedAt,
        updatedAt,
        deletedAt: null,
      })
      .run()

    return { ok: true }
  }

  if (existing.createdByUserId !== userId) {
    return { ok: false, reason: "not_owner" }
  }
  if (isStale(existing.updatedAt, change.updatedAt)) {
    return {
      ok: false,
      reason: "stale",
      serverUpdatedAt: dateToMs(existing.updatedAt) ?? undefined,
    }
  }

  db.update(list)
    .set({
      name: data.name,
      description: data.description,
      image: data.image,
      updatedAt,
      deletedAt: null,
    })
    .where(eq(list.id, change.id))
    .run()

  return { ok: true }
}

function applyTaskChange(
  db: Db,
  userId: string,
  change: TaskPushChange,
): ApplyResult {
  const existing = db.select().from(task).where(eq(task.id, change.id)).get()
  const updatedAt = msToDate(change.updatedAt)

  if (change.operation === "delete") {
    if (!existing) {
      return { ok: false, reason: "not_found" }
    }
    if (existing.createdByUserId !== userId) {
      return { ok: false, reason: "not_owner" }
    }
    if (isStale(existing.updatedAt, change.updatedAt)) {
      return {
        ok: false,
        reason: "stale",
        serverUpdatedAt: dateToMs(existing.updatedAt) ?? undefined,
      }
    }

    db.update(task)
      .set({ deletedAt: updatedAt, updatedAt })
      .where(eq(task.id, change.id))
      .run()

    return { ok: true }
  }

  const data = change.data

  const parentList = ownedList(db, userId, data.listId)
  if (!parentList) {
    return { ok: false, reason: "invalid_list" }
  }

  if (!existing) {
    db.insert(task)
      .values({
        id: change.id,
        listId: data.listId,
        title: data.title,
        notes: data.notes,
        completedAt: optionalMsToDate(data.completedAt),
        dueDate: optionalMsToDate(data.dueDate),
        position: data.position,
        createdByUserId: userId,
        createdAt: updatedAt,
        updatedAt,
        deletedAt: null,
      })
      .run()

    return { ok: true }
  }

  if (existing.createdByUserId !== userId) {
    return { ok: false, reason: "not_owner" }
  }
  if (isStale(existing.updatedAt, change.updatedAt)) {
    return {
      ok: false,
      reason: "stale",
      serverUpdatedAt: dateToMs(existing.updatedAt) ?? undefined,
    }
  }

  db.update(task)
    .set({
      listId: data.listId,
      title: data.title,
      notes: data.notes,
      completedAt: optionalMsToDate(data.completedAt),
      dueDate: optionalMsToDate(data.dueDate),
      position: data.position,
      updatedAt,
      deletedAt: null,
    })
    .where(eq(task.id, change.id))
    .run()

  return { ok: true }
}

function applyChange(db: Db, userId: string, change: PushChange): ApplyResult {
  if (change.table === "list") {
    return applyListChange(db, userId, change)
  }

  return applyTaskChange(db, userId, change)
}

export function pushSync(
  db: Db,
  userId: string,
  changes: PushChange[],
): PushResponse {
  const accepted: string[] = []
  const rejected: RejectedChange[] = []

  for (const change of changes) {
    const result = applyChange(db, userId, change)

    if (result.ok) {
      accepted.push(change.id)
      continue
    }

    rejected.push(reject(change.id, result.reason, result.serverUpdatedAt))
  }

  return { accepted, rejected }
}
