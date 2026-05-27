import { app } from "./app";
import { config } from "./lib/config";
import syncRoutes from "./routes/sync";

app
  .use(syncRoutes)
  .get("/me", ({ user }) => user, { auth: true })
  .get("/", () => "Hello Elysia")
  .listen(config.server.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
