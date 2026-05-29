import type { List, Task } from "../lists"
import { dateToMs } from "../lib/dates"
import type { ListSyncData, SyncChange, TaskSyncData } from "./types"

function listData(list: List): ListSyncData {
  return {
    name: list.name,
    description: list.description,
    image: list.image,
    deletedAt: dateToMs(list.deletedAt),
  }
}

function taskData(task: Task): TaskSyncData {
  return {
    listId: task.listId,
    title: task.title,
    notes: task.notes,
    completedAt: dateToMs(task.completedAt),
    dueDate: dateToMs(task.dueDate),
    position: task.position,
    deletedAt: dateToMs(task.deletedAt),
  }
}

export function listToChange(list: List): SyncChange {
  const deletedAt = dateToMs(list.deletedAt)

  return {
    table: "list",
    id: list.id,
    operation: deletedAt ? "delete" : "update",
    updatedAt: dateToMs(list.updatedAt) ?? 0,
    data: listData(list),
  }
}

export function taskToChange(task: Task): SyncChange {
  const deletedAt = dateToMs(task.deletedAt)

  return {
    table: "task",
    id: task.id,
    operation: deletedAt ? "delete" : "update",
    updatedAt: dateToMs(task.updatedAt) ?? 0,
    data: taskData(task),
  }
}
