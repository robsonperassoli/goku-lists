import type { db } from "../db"
import { msToDate } from "../lib/dates"
import * as lists from "../lists"
import { getListMembersForUser } from "../lists/members"
import { listMemberToChange, listToChange, taskToChange } from "./mappers"
import type { PullResponse, SyncChange } from "./types"

type Db = typeof db

export function pullSync(db: Db, userId: string, since?: number): PullResponse {
  const isInitial = since === undefined
  const query = {
    since: since !== undefined ? msToDate(since) : undefined,
    includeDeleted: !isInitial,
  }

  const listChanges = lists.getListsForUser(db, userId, query).map(listToChange)
  const taskChanges = lists.getTasksForUser(db, userId, query).map(taskToChange)
  const memberChanges = getListMembersForUser(db, userId, query).map(
    listMemberToChange,
  )

  const changes: SyncChange[] = [
    ...listChanges,
    ...taskChanges,
    ...memberChanges,
  ].sort((a, b) => a.updatedAt - b.updatedAt)

  const cursor =
    changes.length > 0
      ? Math.max(...changes.map((change) => change.updatedAt))
      : (since ?? 0)

  return { cursor, changes }
}
