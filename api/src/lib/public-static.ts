import { serveStatic } from "@hono/node-server/serve-static"

export function servePublicAssets(root: string) {
  return serveStatic({
    root,
    rewriteRequestPath: (path) => path.replace(/^\/public\/?/, ""),
    onFound: (_path, c) => {
      c.header("Cache-Control", "public, max-age=300")
    },
  })
}
