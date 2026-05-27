import { Temporal } from "@js-temporal/polyfill"

function instantFromMs(ms: number): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(ms)
}

export function msToDate(ms: number): Date {
  return new Date(instantFromMs(ms).epochMilliseconds)
}

export function optionalMsToDate(ms: number | null | undefined): Date | null {
  return ms == null ? null : msToDate(ms)
}

export function dateToMs(date: Date | null | undefined): number | null {
  if (date == null) {
    return null
  }

  return instantFromMs(date.getTime()).epochMilliseconds
}

export function isStale(serverUpdatedAt: Date, pushUpdatedAt: number): boolean {
  const server = instantFromMs(serverUpdatedAt.getTime())
  const push = instantFromMs(pushUpdatedAt)

  return Temporal.Instant.compare(server, push) > 0
}
