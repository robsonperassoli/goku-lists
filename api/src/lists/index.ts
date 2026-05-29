import type { db } from "../db"
import type { list, task } from "../db/schema"
import * as listRepo from "./list-repository"
import * as taskRepo from "./task-repository"
import type {
  ChangesQuery,
  DeleteList,
  DeleteTask,
  List,
  ListsError,
  ListsResult,
  NewList,
  NewTask,
  Task,
  UpdateList,
  UpdateTask,
} from "./types"

type Db = typeof db
type ListRow = typeof list.$inferSelect
type TaskRow = typeof task.$inferSelect

function ok<T>(data: T): ListsResult<T> {
  return { success: true, data }
}

function err(error: ListsError): ListsResult<never> {
  return { success: false, error }
}

function toList(row: ListRow): List {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    listId: row.listId,
    title: row.title,
    notes: row.notes,
    completedAt: row.completedAt,
    dueDate: row.dueDate,
    position: row.position ?? 0,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

export function getList(db: Db, id: string): List | undefined {
  const row = listRepo.findListById(db, id)
  return row ? toList(row) : undefined
}

export function getTask(db: Db, id: string): Task | undefined {
  const row = taskRepo.findTaskById(db, id)
  return row ? toTask(row) : undefined
}

export function getListsForUser(
  db: Db,
  userId: string,
  query: ChangesQuery,
): List[] {
  return listRepo.findListsByUser(db, userId, query).map(toList)
}

export function getTasksForUser(
  db: Db,
  userId: string,
  query: ChangesQuery,
): Task[] {
  return taskRepo.findTasksByUser(db, userId, query).map(toTask)
}

export function createList(
  db: Db,
  userId: string,
  input: NewList,
): ListsResult<List> {
  const existing = listRepo.findListById(db, input.id)

  if (existing) {
    if (existing.createdByUserId !== userId) {
      return err({ code: "not_owner" })
    }

    return updateList(db, userId, input.id, {
      name: input.name,
      description: input.description,
      image: input.image,
      updatedAt: input.updatedAt,
    })
  }

  listRepo.insertList(db, {
    id: input.id,
    name: input.name,
    description: input.description,
    image: input.image,
    createdByUserId: userId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    deletedAt: null,
  })

  return ok(toList(listRepo.findListById(db, input.id)!))
}

export function updateList(
  db: Db,
  userId: string,
  id: string,
  input: UpdateList,
): ListsResult<List> {
  const existing = listRepo.findListById(db, id)

  if (!existing) {
    return err({ code: "not_found" })
  }

  if (existing.createdByUserId !== userId) {
    return err({ code: "not_owner" })
  }

  listRepo.updateListById(db, id, {
    name: input.name,
    description: input.description,
    image: input.image,
    updatedAt: input.updatedAt,
    deletedAt: null,
  })

  return ok(toList(listRepo.findListById(db, id)!))
}

export function deleteList(
  db: Db,
  userId: string,
  id: string,
  input: DeleteList,
): ListsResult<List> {
  const existing = listRepo.findListById(db, id)

  if (!existing) {
    return err({ code: "not_found" })
  }

  if (existing.createdByUserId !== userId) {
    return err({ code: "not_owner" })
  }

  listRepo.updateListById(db, id, {
    name: existing.name,
    description: existing.description,
    image: existing.image,
    updatedAt: input.updatedAt,
    deletedAt: input.deletedAt,
  })

  return ok(toList(listRepo.findListById(db, id)!))
}

export function createTask(
  db: Db,
  userId: string,
  input: NewTask,
): ListsResult<Task> {
  const parentList = listRepo.findOwnedListById(db, userId, input.listId)

  if (!parentList) {
    return err({ code: "invalid_list" })
  }

  const existing = taskRepo.findTaskById(db, input.id)

  if (existing) {
    if (existing.createdByUserId !== userId) {
      return err({ code: "not_owner" })
    }

    return updateTask(db, userId, input.id, {
      listId: input.listId,
      title: input.title,
      notes: input.notes,
      completedAt: input.completedAt,
      dueDate: input.dueDate,
      position: input.position,
      updatedAt: input.updatedAt,
    })
  }

  taskRepo.insertTask(db, {
    id: input.id,
    listId: input.listId,
    title: input.title,
    notes: input.notes,
    completedAt: input.completedAt,
    dueDate: input.dueDate,
    position: input.position,
    createdByUserId: userId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    deletedAt: null,
  })

  return ok(toTask(taskRepo.findTaskById(db, input.id)!))
}

export function updateTask(
  db: Db,
  userId: string,
  id: string,
  input: UpdateTask,
): ListsResult<Task> {
  const existing = taskRepo.findTaskById(db, id)

  if (!existing) {
    return err({ code: "not_found" })
  }

  if (existing.createdByUserId !== userId) {
    return err({ code: "not_owner" })
  }

  const parentList = listRepo.findOwnedListById(db, userId, input.listId)

  if (!parentList) {
    return err({ code: "invalid_list" })
  }

  taskRepo.updateTaskById(db, id, {
    listId: input.listId,
    title: input.title,
    notes: input.notes,
    completedAt: input.completedAt,
    dueDate: input.dueDate,
    position: input.position,
    updatedAt: input.updatedAt,
    deletedAt: null,
  })

  return ok(toTask(taskRepo.findTaskById(db, id)!))
}

export function deleteTask(
  db: Db,
  userId: string,
  id: string,
  input: DeleteTask,
): ListsResult<Task> {
  const existing = taskRepo.findTaskById(db, id)

  if (!existing) {
    return err({ code: "not_found" })
  }

  if (existing.createdByUserId !== userId) {
    return err({ code: "not_owner" })
  }

  taskRepo.updateTaskById(db, id, {
    listId: existing.listId,
    title: existing.title,
    notes: existing.notes,
    completedAt: existing.completedAt,
    dueDate: existing.dueDate,
    position: existing.position ?? 0,
    updatedAt: input.updatedAt,
    deletedAt: input.deletedAt,
  })

  return ok(toTask(taskRepo.findTaskById(db, id)!))
}

export type {
  ChangesQuery,
  DeleteList,
  DeleteTask,
  List,
  ListsError,
  ListsResult,
  NewList,
  NewTask,
  Task,
  UpdateList,
  UpdateTask,
} from "./types"
