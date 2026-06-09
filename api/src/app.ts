import { cors } from "@elysiajs/cors"
import { staticPlugin } from "@elysiajs/static"
import { Elysia } from "elysia"
import { auth } from "./lib/auth"
import { config } from "./lib/config"
import { withRequestLogging } from "./lib/request-logging"

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        })

        if (!session) return status(401)

        return {
          user: session.user,
          session: session.session,
        }
      },
    },
  })

export const app = withRequestLogging(new Elysia())
  .use(
    cors({
      origin: config.server.frontendUrl,
      credentials: true,
    }),
  )
  .use(
    staticPlugin({
      assets: config.public.dir,
      prefix: "/public",
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }),
  )
  .use(betterAuth)

export type App = typeof app
