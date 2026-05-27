import { and, asc, eq, gt, isNull } from "drizzle-orm"
import type { db } from "../db"
import { list, task } from "../db/schema"
import { msToDate } from "../lib/dates"
import { listRowToChange, taskRowToChange } from "./mappers"

import type { PullResponse, SyncChange } from "./types"

type Db = typeof db

export function pullSync(db: Db, userId: string, since?: number): PullResponse {
  const isInitial = since === undefined
  const sinceDate = since !== undefined ? msToDate(since) : undefined

  const listConditions = [eq(list.createdByUserId, userId)]
  const taskConditions = [eq(task.createdByUserId, userId)]

  if (isInitial) {
    listConditions.push(isNull(list.deletedAt))
    taskConditions.push(isNull(task.deletedAt))
  } else if (sinceDate) {
    listConditions.push(gt(list.updatedAt, sinceDate))
    taskConditions.push(gt(task.updatedAt, sinceDate))
  }

  const lists = db
    .select()
    .from(list)
    .where(and(...listConditions))
    .orderBy(asc(list.updatedAt))
    .all()

  const tasks = db
    .select()
    .from(task)
    .where(and(...taskConditions))
    .orderBy(asc(task.updatedAt))
    .all()

  const changes: SyncChange[] = [
    ...lists.map(listRowToChange),
    ...tasks.map(taskRowToChange),
  ].sort((a, b) => a.updatedAt - b.updatedAt)

  const cursor =
    changes.length > 0
      ? Math.max(...changes.map((change) => change.updatedAt))
      : (since ?? 0)

  return { cursor, changes }
}
