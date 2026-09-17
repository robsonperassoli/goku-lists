import { serve } from "@hono/node-server"

import { app } from "./app"
import { config } from "./lib/config"

serve({
  fetch: app.fetch,
  port: config.server.port,
})

console.log(`API listening on http://localhost:${config.server.port}`)
