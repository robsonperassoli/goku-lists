import { app } from "./app"
import { config } from "./lib/config"
import apkUploadRoutes from "./routes/apk-upload"
import homeRoutes from "./routes/home"
import invitationRoutes from "./routes/invitations"
import listRoutes from "./routes/lists"
import syncRoutes from "./routes/sync"
import wellKnownRoutes from "./routes/well-known"

app
  .use(apkUploadRoutes)
  .use(syncRoutes)
  .use(listRoutes)
  .use(invitationRoutes)
  .use(wellKnownRoutes)
  .use(homeRoutes)
  .get("/me", ({ user }) => user, { auth: true })
  .listen(config.server.port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
