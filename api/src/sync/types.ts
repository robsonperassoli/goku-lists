export type SyncTable = "list" | "task"

export type SyncOperation = "create" | "update" | "delete"

export type ListPushData = {
  name: string
  description: string | null
  image: string | null
}

export type TaskPushData = {
  listId: string
  title: string
  notes: string | null
  completedAt: number | null
  dueDate: number | null
  position: number
}

export type ListSyncData = ListPushData & {
  deletedAt: number | null
}

export type TaskSyncData = TaskPushData & {
  deletedAt: number | null
}

export type PushChange =
  | {
      table: "list"
      id: string
      operation: "create" | "update"
      updatedAt: number
      data: ListPushData
    }
  | {
      table: "list"
      id: string
      operation: "delete"
      updatedAt: number
    }
  | {
      table: "task"
      id: string
      operation: "create" | "update"
      updatedAt: number
      data: TaskPushData
    }
  | {
      table: "task"
      id: string
      operation: "delete"
      updatedAt: number
    }

export type SyncChange = {
  table: SyncTable
  id: string
  operation: SyncOperation
  updatedAt: number
  data?: ListSyncData | TaskSyncData
}

export type PullResponse = {
  cursor: number
  changes: SyncChange[]
}

export type PushRequest = {
  changes: PushChange[]
}

export type RejectedChange = {
  id: string
  reason: string
  serverUpdatedAt?: number
}

export type PushResponse = {
  accepted: string[]
  rejected: RejectedChange[]
}
