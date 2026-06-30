import { ApiAuthError, ApiTransportError, apiFetch } from "@/api/client";
import { config } from "@/lib/config";

export type InvitationPreview = {
  token: string;
  listId: string;
  listName: string;
  inviterName: string;
  expiresAt: number;
  acceptedAt: number | null;
  revokedAt: number | null;
};

export type CreatedInvitation = {
  token: string;
  expiresAt: number;
};

export function getInvitationState(
  preview: Pick<InvitationPreview, "expiresAt" | "acceptedAt" | "revokedAt">,
  now = Date.now(),
): "pending" | "accepted" | "expired" | "revoked" {
  if (preview.revokedAt) {
    return "revoked";
  }

  if (preview.acceptedAt) {
    return "accepted";
  }

  if (preview.expiresAt <= now) {
    return "expired";
  }

  return "pending";
}

export async function createInvitation(
  listId: string,
): Promise<CreatedInvitation> {
  const response = await apiFetch(`/lists/${listId}/invitations`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new ApiTransportError(
      `Create invitation failed with status ${response.status}`,
    );
  }

  return (await response.json()) as CreatedInvitation;
}

export async function getInvitationPreview(
  token: string,
): Promise<InvitationPreview> {
  let response: Response;

  try {
    response = await apiFetch(`/invitations/${token}`);
  } catch (error) {
    if (error instanceof ApiAuthError) {
      throw error;
    }

    throw new ApiTransportError();
  }

  if (!response.ok) {
    throw new ApiTransportError(
      `Invitation preview failed with status ${response.status}`,
    );
  }

  return (await response.json()) as InvitationPreview;
}

export async function acceptInvitation(
  token: string,
): Promise<{ listId: string }> {
  const response = await apiFetch(`/invitations/${token}/accept`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new ApiTransportError(
      `Accept invitation failed with status ${response.status}`,
    );
  }

  return (await response.json()) as { listId: string };
}

export async function leaveList(listId: string): Promise<void> {
  const response = await apiFetch(`/lists/${listId}/members/me`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new ApiTransportError(
      `Leave list failed with status ${response.status}`,
    );
  }
}

export function invitationLink(token: string): string {
  const baseUrl = config.apiUrl?.replace(/\/$/, "");
  if (!baseUrl) {
    return `goku-lists://invite/${token}`;
  }

  return `${baseUrl}/invitations/${token}`;
}
