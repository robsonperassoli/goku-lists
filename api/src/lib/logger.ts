import { config } from "./config"
import { nowDevTime, nowIsoTimestamp } from "./dates"

type LogLevel = "info" | "warn" | "error"

const isTTY = process.stdout.isTTY ?? false

function useDevStyle() {
  return config.devMode && isTTY
}

function style(code: string, text: string) {
  if (!useDevStyle()) {
    return text
  }

  return `${code}${text}\x1b[0m`
}

const tone = {
  dim: (text: string) => style("\x1b[2m", text),
  red: (text: string) => style("\x1b[31m", text),
  yellow: (text: string) => style("\x1b[33m", text),
  green: (text: string) => style("\x1b[32m", text),
  cyan: (text: string) => style("\x1b[36m", text),
}

function timestamp() {
  const value = config.devMode ? nowDevTime() : nowIsoTimestamp()
  return useDevStyle() ? tone.dim(value) : value
}

function levelLabel(level: LogLevel) {
  const label = level.toUpperCase()

  if (!useDevStyle()) {
    return label
  }

  if (level === "error") {
    return tone.red(label)
  }

  if (level === "warn") {
    return tone.yellow(label)
  }

  return tone.dim(label)
}

function formatLine(level: LogLevel, message: string) {
  return `${timestamp()} ${levelLabel(level)} ${message}`
}

function statusTone(status: number, text: string) {
  if (!useDevStyle()) {
    return text
  }

  if (status >= 500) {
    return tone.red(text)
  }

  if (status >= 400) {
    return tone.yellow(text)
  }

  return tone.green(text)
}

function formatHttpRequest(
  method: string,
  path: string,
  status: number,
  durationMs: number,
) {
  const methodText = useDevStyle() ? tone.cyan(method) : method
  const duration = useDevStyle()
    ? tone.dim(`${durationMs}ms`)
    : `${durationMs}ms`

  return `${methodText} ${path} ${statusTone(status, String(status))} ${duration}`
}

function writeErrorDetails(error: unknown) {
  if (error instanceof Error && error.stack) {
    console.error(error.stack)
    return
  }

  if (error !== undefined) {
    console.error(error)
  }
}

function write(level: LogLevel, message: string, error?: unknown) {
  const line = formatLine(level, message)

  if (level === "info") {
    console.log(line)
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.error(line)
  }

  if (error !== undefined) {
    writeErrorDetails(error)
  }
}

export const logger = {
  info(message: string) {
    write("info", message)
  },

  warn(message: string, error?: unknown) {
    write("warn", message, error)
  },

  error(message: string, error?: unknown) {
    write("error", message, error)
  },

  http(method: string, path: string, status: number, durationMs: number) {
    const message = formatHttpRequest(method, path, status, durationMs)
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info"

    write(level, message)
  },
}
