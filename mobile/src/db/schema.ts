import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type List = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
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
});
