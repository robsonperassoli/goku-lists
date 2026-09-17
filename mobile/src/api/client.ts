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

async function getAuthCookie(): Promise<string | null> {
  const cookie = await authClient.getCookie();
  if (typeof cookie !== "string" || cookie.length === 0) {
    return null;
  }
  return cookie;
}

export async function hasAuthSession(): Promise<boolean> {
  return (await getAuthCookie()) != null;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookie = await getAuthCookie();
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
