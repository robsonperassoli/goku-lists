import { app } from "./app"
import { config } from "./lib/config"
import invitationRoutes from "./routes/invitations"
import listRoutes from "./routes/lists"
import syncRoutes from "./routes/sync"
import appInfoRoutes from "./routes/app-info"
import wellKnownRoutes from "./routes/well-known"

app
  .use(syncRoutes)
  .use(listRoutes)
  .use(invitationRoutes)
  .use(wellKnownRoutes)
  .use(appInfoRoutes)
  .get("/me", ({ user }) => user, { auth: true })
  .listen(config.server.port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
