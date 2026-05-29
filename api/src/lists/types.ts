export type ListsError =
  | { code: "not_found" }
  | { code: "not_owner" }
  | { code: "invalid_list" }

export type ListsResult<T> =
  | { success: true; data: T }
  | { success: false; error: ListsError }

export type NewList = {
  id: string
  name: string
  description: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export type UpdateList = {
  name: string
  description: string | null
  image: string | null
  updatedAt: Date
}

export type DeleteList = {
  updatedAt: Date
  deletedAt: Date
}

export type List = {
  id: string
  name: string
  description: string | null
  image: string | null
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type NewTask = {
  id: string
  listId: string
  title: string
  notes: string | null
  completedAt: Date | null
  dueDate: Date | null
  position: number
  createdAt: Date
  updatedAt: Date
}

export type UpdateTask = {
  listId: string
  title: string
  notes: string | null
  completedAt: Date | null
  dueDate: Date | null
  position: number
  updatedAt: Date
}

export type DeleteTask = {
  updatedAt: Date
  deletedAt: Date
}

export type Task = {
  id: string
  listId: string
  title: string
  notes: string | null
  completedAt: Date | null
  dueDate: Date | null
  position: number
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type ChangesQuery = {
  since?: Date
  includeDeleted: boolean
}
