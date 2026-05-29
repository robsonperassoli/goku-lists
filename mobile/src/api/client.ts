import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/config";

export class ApiAuthError extends Error {
  constructor() {
    super("API request stopped: no auth session");
    this.name = "ApiAuthError";
  }
}

export class ApiTransportError extends Error {
  constructor(message = "API transport failed") {
    super(message);
    this.name = "ApiTransportError";
  }
}

function getAuthCookie(): string | null {
  const cookie = authClient.getCookie();
  return cookie || null;
}

export function hasAuthSession(): boolean {
  return getAuthCookie() != null;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookie = getAuthCookie();
  if (!cookie || !config.apiUrl) {
    throw new ApiAuthError();
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      ...init.headers,
    },
  });

  if (response.status === 401) {
    throw new ApiAuthError();
  }

  return response;
}
