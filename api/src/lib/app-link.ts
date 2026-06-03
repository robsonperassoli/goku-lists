export const APP_SCHEME = "goku-lists"
export const ANDROID_PACKAGE = "com.gokulists.app"

export function appDeepLink(path: string): string {
  return `${APP_SCHEME}://${path.replace(/^\//, "")}`
}

export function androidIntentLink(
  path: string,
  options: { httpsFallback: string; package?: string },
): string {
  const packageName = options.package ?? ANDROID_PACKAGE
  const schemePath = path.replace(/^\//, "")

  return (
    `intent://${schemePath}#Intent;` +
    `scheme=${APP_SCHEME};` +
    `package=${packageName};` +
    `S.browser_fallback_url=${encodeURIComponent(options.httpsFallback)};` +
    "end"
  )
}
