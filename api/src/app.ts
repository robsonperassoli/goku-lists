import { Hono } from "hono"
import { cors } from "hono/cors"

import { auth } from "./lib/auth"
import { config } from "./lib/config"
import { servePublicAssets } from "./lib/public-static"
import { handleAppError, requestLogging } from "./lib/request-logging"
import { apkUploadRoutes } from "./routes/apk-upload"
import { homeRoutes } from "./routes/home"
import { invitationRoutes } from "./routes/invitations"
import { listRoutes } from "./routes/lists"
import { meRoutes } from "./routes/me"
import { syncRoutes } from "./routes/sync"
import { wellKnownRoutes } from "./routes/well-known"

const app = new Hono()
  .use("*", requestLogging)
  .use(
    "*",
    cors({
      origin: config.server.frontendUrl,
      credentials: true,
    }),
  )
  .use("/public/*", servePublicAssets(config.public.dir))
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .route("/", apkUploadRoutes)
  .route("/", syncRoutes)
  .route("/", listRoutes)
  .route("/", invitationRoutes)
  .route("/", wellKnownRoutes)
  .route("/", homeRoutes)
  .route("/", meRoutes)

app.onError(handleAppError)

export { app }
export type AppType = typeof app
