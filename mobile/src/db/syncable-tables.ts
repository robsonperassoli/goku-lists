import { list, task } from "./schema";

export const SYNCABLE_TABLE_NAMES = ["list", "task"] as const;

export type SyncableTableName = (typeof SYNCABLE_TABLE_NAMES)[number];

export const syncableTables = {
  list,
  task,
} as const;
