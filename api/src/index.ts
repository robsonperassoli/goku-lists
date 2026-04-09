import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { config } from "./lib/config";
import syncRoutes from "./routes/sync";

const app = new Elysia()
  .use(
    cors({
      origin: config.server.frontendUrl,
      credentials: true,
    }),
  )
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) {
          throw new Error("Unauthorized");
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .use(syncRoutes)
  .get("/me", ({ user }) => user, { auth: true })
  .get("/", () => "Hello Elysia")
  .listen(config.server.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
