import type { db } from "../db"
import {
  dateToMs,
  isStale,
  msToDate,
  optionalMsToDate,
} from "../lib/dates"
import * as lists from "../lists"
import type { ListsResult } from "../lists"
import type { List, Task } from "../lists"
import type { PushChange, PushResponse, RejectedChange } from "./types"

type Db = typeof db

type ApplySyncResult =
  | { ok: true }
  | { ok: false; reason: string; serverUpdatedAt?: number }

type ListPushChange = Extract<PushChange, { table: "list" }>
type TaskPushChange = Extract<PushChange, { table: "task" }>

function reject(
  id: string,
  reason: string,
  serverUpdatedAt?: number,
): RejectedChange {
  return { id, reason, serverUpdatedAt }
}

function staleReject(entity: List | Task, changeUpdatedAt: number): ApplySyncResult {
  return {
    ok: false,
    reason: "stale",
    serverUpdatedAt: dateToMs(entity.updatedAt) ?? undefined,
  }
}

function mapListsResult(result: ListsResult<unknown>): ApplySyncResult {
  if (result.success) {
    return { ok: true }
  }

  return { ok: false, reason: result.error.code }
}

function applyListChange(
  db: Db,
  userId: string,
  change: ListPushChange,
): ApplySyncResult {
  const updatedAt = msToDate(change.updatedAt)
  const tombstone = { updatedAt, deletedAt: updatedAt }

  if (change.operation === "delete") {
    const existing = lists.getList(db, change.id)

    if (!existing) {
      return { ok: false, reason: "not_found" }
    }

    if (isStale(existing.updatedAt, change.updatedAt)) {
      return staleReject(existing, change.updatedAt)
    }

    return mapListsResult(
      lists.deleteList(db, userId, change.id, tombstone),
    )
  }

  const data = change.data
  const existing = lists.getList(db, change.id)

  if (existing) {
    if (isStale(existing.updatedAt, change.updatedAt)) {
      return staleReject(existing, change.updatedAt)
    }

    return mapListsResult(
      lists.updateList(db, userId, change.id, {
        name: data.name,
        description: data.description,
        image: data.image,
        updatedAt,
      }),
    )
  }

  return mapListsResult(
    lists.createList(db, userId, {
      id: change.id,
      name: data.name,
      description: data.description,
      image: data.image,
      createdAt: updatedAt,
      updatedAt,
    }),
  )
}

function applyTaskChange(
  db: Db,
  userId: string,
  change: TaskPushChange,
): ApplySyncResult {
  const updatedAt = msToDate(change.updatedAt)
  const tombstone = { updatedAt, deletedAt: updatedAt }

  if (change.operation === "delete") {
    const existing = lists.getTask(db, change.id)

    if (!existing) {
      return { ok: false, reason: "not_found" }
    }

    if (isStale(existing.updatedAt, change.updatedAt)) {
      return staleReject(existing, change.updatedAt)
    }

    return mapListsResult(
      lists.deleteTask(db, userId, change.id, tombstone),
    )
  }

  const data = change.data
  const existing = lists.getTask(db, change.id)

  if (existing) {
    if (isStale(existing.updatedAt, change.updatedAt)) {
      return staleReject(existing, change.updatedAt)
    }

    return mapListsResult(
      lists.updateTask(db, userId, change.id, {
        listId: data.listId,
        title: data.title,
        notes: data.notes,
        completedAt: optionalMsToDate(data.completedAt),
        dueDate: optionalMsToDate(data.dueDate),
        position: data.position,
        updatedAt,
      }),
    )
  }

  return mapListsResult(
    lists.createTask(db, userId, {
      id: change.id,
      listId: data.listId,
      title: data.title,
      notes: data.notes,
      completedAt: optionalMsToDate(data.completedAt),
      dueDate: optionalMsToDate(data.dueDate),
      position: data.position,
      createdAt: updatedAt,
      updatedAt,
    }),
  )
}

function applyChange(db: Db, userId: string, change: PushChange): ApplySyncResult {
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
