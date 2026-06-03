import * as SecureStore from "expo-secure-store";

const KEY = "goku-lists.pendingInviteToken";

export async function setPendingInviteToken(token: string) {
  await SecureStore.setItemAsync(KEY, token);
}

export async function getPendingInviteToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY);
}

export async function clearPendingInviteToken() {
  await SecureStore.deleteItemAsync(KEY);
}
