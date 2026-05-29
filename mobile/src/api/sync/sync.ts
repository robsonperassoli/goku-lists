import { ApiAuthError, ApiTransportError, apiFetch } from "../client";
import type { PullResponse, PushChange, PushResponse } from "./types";

export async function postSync(changes: PushChange[]): Promise<PushResponse> {
  let response: Response;

  try {
    response = await apiFetch("/sync", {
      method: "POST",
      body: JSON.stringify({ changes }),
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      throw error;
    }

    throw new ApiTransportError();
  }

  if (response.status >= 500) {
    throw new ApiTransportError();
  }

  if (!response.ok) {
    throw new ApiTransportError(`Push failed with status ${response.status}`);
  }

  return (await response.json()) as PushResponse;
}

export async function getSync(since?: number): Promise<PullResponse> {
  const path = since === undefined ? "/sync" : `/sync?since=${since}`;
  let response: Response;

  try {
    response = await apiFetch(path);
  } catch (error) {
    if (error instanceof ApiAuthError) {
      throw error;
    }

    throw new ApiTransportError();
  }

  if (!response.ok) {
    if (response.status >= 500) {
      throw new ApiTransportError();
    }

    throw new ApiTransportError(`Pull failed with status ${response.status}`);
  }

  return (await response.json()) as PullResponse;
}
