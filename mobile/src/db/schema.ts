import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export type List = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateListArgs = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

export type UpdateListArgs = CreateListArgs;

export type Task = {
  id: string;
  listId: string;
  title: string;
  notes: string | null;
  completedAt: Date | null;
  dueDate: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateTaskArgs = {
  id: string;
  listId: string;
  title: string;
  notes?: string;
};

export type UpdateTaskArgs = {
  id: string;
  title: string;
  notes?: string;
  completedAt?: Date | null;
  dueDate?: Date | null;
  position?: number;
};

export const list = sqliteTable("list", {
  id: text().primaryKey(),
  name: text().notNull(),
  description: text(),
  image: text(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const task = sqliteTable("task", {
  id: text().primaryKey(),
  listId: text("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  title: text().notNull(),
  notes: text(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  dueDate: integer("due_date", { mode: "timestamp_ms" }),
  position: real("position").default(0.0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export type SyncOperation = "create" | "update" | "delete";

export const syncQueue = sqliteTable(
  "sync_queue",
  {
    id: text().primaryKey(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    operation: text().notNull().$type<SyncOperation>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("sync_queue_table_record_idx").on(
      table.tableName,
      table.recordId,
    ),
  ],
);

export const syncState = sqliteTable("sync_state", {
  id: text().primaryKey(),
  cursor: integer(),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
});
