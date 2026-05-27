import type { list, task } from "../db/schema"
import { dateToMs } from "../lib/dates"
import type { ListSyncData, SyncChange, TaskSyncData } from "./types"

type ListRow = typeof list.$inferSelect
type TaskRow = typeof task.$inferSelect

function listData(row: ListRow): ListSyncData {
  return {
    name: row.name,
    description: row.description,
    image: row.image,
    deletedAt: dateToMs(row.deletedAt),
  }
}

function taskData(row: TaskRow): TaskSyncData {
  return {
    listId: row.listId,
    title: row.title,
    notes: row.notes,
    completedAt: dateToMs(row.completedAt),
    dueDate: dateToMs(row.dueDate),
    position: row.position ?? 0,
    deletedAt: dateToMs(row.deletedAt),
  }
}

export function listRowToChange(row: ListRow): SyncChange {
  const deletedAt = dateToMs(row.deletedAt)

  return {
    table: "list",
    id: row.id,
    operation: deletedAt ? "delete" : "update",
    updatedAt: dateToMs(row.updatedAt) ?? 0,
    data: listData(row),
  }
}

export function taskRowToChange(row: TaskRow): SyncChange {
  const deletedAt = dateToMs(row.deletedAt)

  return {
    table: "task",
    id: row.id,
    operation: deletedAt ? "delete" : "update",
    updatedAt: dateToMs(row.updatedAt) ?? 0,
    data: taskData(row),
  }
}
