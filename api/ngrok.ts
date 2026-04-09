import { config } from "./src/lib/config";

const proc = Bun.spawn(
  ["ngrok", "http", `${config.server.port}`, "--domain", config.ngrokDomain],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);

await proc.exited;
console.log("ngrok exited with code:", proc.exitCode);
