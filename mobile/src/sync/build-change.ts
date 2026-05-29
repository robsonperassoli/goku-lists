import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite/driver";
import { list, syncQueue, task } from "@/db/schema";
import type { SyncableTableName } from "@/db/syncable-tables";
import type { PushChange } from "@/api";

type QueueRow = typeof syncQueue.$inferSelect;

function buildListPushChange(
  row: QueueRow,
  entity: typeof list.$inferSelect,
): PushChange {
  if (row.operation === "delete") {
    return {
      table: "list",
      id: row.recordId,
      operation: "delete",
      updatedAt: entity.updatedAt.getTime(),
    };
  }

  return {
    table: "list",
    id: row.recordId,
    operation: row.operation as "create" | "update",
    updatedAt: entity.updatedAt.getTime(),
    data: {
      name: entity.name,
      description: entity.description,
      image: entity.image,
    },
  };
}

function buildTaskPushChange(
  row: QueueRow,
  entity: typeof task.$inferSelect,
): PushChange {
  if (row.operation === "delete") {
    return {
      table: "task",
      id: row.recordId,
      operation: "delete",
      updatedAt: entity.updatedAt.getTime(),
    };
  }

  return {
    table: "task",
    id: row.recordId,
    operation: row.operation as "create" | "update",
    updatedAt: entity.updatedAt.getTime(),
    data: {
      listId: entity.listId,
      title: entity.title,
      notes: entity.notes,
      completedAt: entity.completedAt?.getTime() ?? null,
      dueDate: entity.dueDate?.getTime() ?? null,
      position: entity.position ?? 0,
    },
  };
}

export function buildPushChange(
  db: ExpoSQLiteDatabase,
  row: QueueRow,
): PushChange | null {
  const tableName = row.tableName as SyncableTableName;

  if (tableName === "list") {
    const entity = db
      .select()
      .from(list)
      .where(eq(list.id, row.recordId))
      .get();

    return entity ? buildListPushChange(row, entity) : null;
  }

  const entity = db
    .select()
    .from(task)
    .where(eq(task.id, row.recordId))
    .get();

  return entity ? buildTaskPushChange(row, entity) : null;
}

export function orderQueueRows(rows: QueueRow[]): QueueRow[] {
  return [...rows].sort((a, b) => {
    if (a.tableName !== b.tableName) {
      return a.tableName === "list" ? -1 : 1;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}
