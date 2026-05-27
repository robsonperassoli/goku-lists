import { t } from "elysia";
import type { App } from "../app";
import { db } from "../db";
import { pullSync, pushSync } from "../sync";

const listDataSchema = t.Object({
  name: t.String(),
  description: t.Nullable(t.String()),
  image: t.Nullable(t.String()),
});

const taskDataSchema = t.Object({
  listId: t.String(),
  title: t.String(),
  notes: t.Nullable(t.String()),
  completedAt: t.Nullable(t.Number()),
  dueDate: t.Nullable(t.Number()),
  position: t.Number(),
});

const listChangeSchema = t.Union([
  t.Object({
    table: t.Literal("list"),
    id: t.String(),
    operation: t.Union([t.Literal("create"), t.Literal("update")]),
    updatedAt: t.Number(),
    data: listDataSchema,
  }),
  t.Object({
    table: t.Literal("list"),
    id: t.String(),
    operation: t.Literal("delete"),
    updatedAt: t.Number(),
  }),
]);

const taskChangeSchema = t.Union([
  t.Object({
    table: t.Literal("task"),
    id: t.String(),
    operation: t.Union([t.Literal("create"), t.Literal("update")]),
    updatedAt: t.Number(),
    data: taskDataSchema,
  }),
  t.Object({
    table: t.Literal("task"),
    id: t.String(),
    operation: t.Literal("delete"),
    updatedAt: t.Number(),
  }),
]);

const changeSchema = t.Union([listChangeSchema, taskChangeSchema]);

export default (app: App) =>
  app
    .get("/sync", ({ user, query }) => pullSync(db, user.id, query.since), {
      auth: true,
      query: t.Object({
        since: t.Optional(t.Integer()),
      }),
    })
    .post("/sync", ({ user, body }) => pushSync(db, user.id, body.changes), {
      auth: true,
      body: t.Object({
        changes: t.Array(changeSchema),
      }),
    });
