import { spawn } from "node:child_process"

import { config } from "./src/lib/config"

const proc = spawn(
  "ngrok",
  ["http", `${config.server.port}`, "--domain", config.ngrokDomain],
  {
    stdio: "inherit",
  },
)

const code = await new Promise<number | null>((resolve) => {
  proc.on("exit", (exitCode) => resolve(exitCode))
})

console.log("ngrok exited with code:", code)
