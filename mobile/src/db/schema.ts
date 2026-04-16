import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
