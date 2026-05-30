import * as Linking from "expo-linking";

export function extractInviteToken(url: string): string | null {
  const parsed = Linking.parse(url);
  const path = parsed.path?.replace(/^\//, "");

  if (!path?.startsWith("invite/")) {
    return null;
  }

  const token = path.slice("invite/".length);
  return token.length > 0 ? token : null;
}
