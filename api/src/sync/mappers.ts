import { dateToMs } from "../lib/dates"
import type { List, ListMember, Task } from "../lists"
import type {
  ListMemberSyncData,
  ListSyncData,
  SyncChange,
  TaskSyncData,
} from "./types"

function memberId(member: ListMember): string {
  return `${member.listId}:${member.userId}`
}

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

function memberData(member: ListMember): ListMemberSyncData {
  return {
    listId: member.listId,
    userId: member.userId,
    role: member.role,
    deletedAt: dateToMs(member.deletedAt),
  }
}

export function listMemberToChange(member: ListMember): SyncChange {
  const deletedAt = dateToMs(member.deletedAt)

  return {
    table: "list_member",
    id: memberId(member),
    operation: deletedAt ? "delete" : "update",
    updatedAt: dateToMs(member.updatedAt) ?? 0,
    data: memberData(member),
  }
}
