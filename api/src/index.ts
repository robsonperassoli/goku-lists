import { app } from "./app"
import { config } from "./lib/config"
import invitationRoutes from "./routes/invitations"
import listRoutes from "./routes/lists"
import syncRoutes from "./routes/sync"
import wellKnownRoutes from "./routes/well-known"

app
  .use(syncRoutes)
  .use(listRoutes)
  .use(invitationRoutes)
  .use(wellKnownRoutes)
  .get("/me", ({ user }) => user, { auth: true })
  .get("/", () => "Hello Elysia")
  .listen(config.server.port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
