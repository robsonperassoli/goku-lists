import { cors } from "@elysiajs/cors"
import { Elysia } from "elysia"
import { auth } from "./lib/auth"

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      credentials: true,
    }),
  )
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) {
          throw new Error("Unauthorized")
        }

        return {
          user: session.user,
          session: session.session,
        }
      },
    },
  })
  .get("/me", ({ user }) => user, { auth: true })
  .get("/", () => "Hello Elysia")
  .listen(process.env.PORT ?? 3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
