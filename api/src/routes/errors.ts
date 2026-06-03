export function invitationErrorStatus(code: string): 403 | 404 | 410 | 409 {
  switch (code) {
    case "not_found":
      return 404
    case "expired":
      return 410
    case "already_accepted":
      return 409
    default:
      return 403
  }
}
