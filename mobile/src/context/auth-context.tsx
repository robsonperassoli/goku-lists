import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, useSegments } from "expo-router";
import { authClient } from "@/lib/auth-client";

type SessionData = ReturnType<typeof authClient.useSession>["data"];
type SessionUser = NonNullable<SessionData>["user"];

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
  session: SessionData;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  // Offline-first: the expo plugin hydrates the cached session synchronously,
  // so we are "ready" as soon as we have a session or the first fetch settles.
  const isReady = !isPending || session != null;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [session, isReady, segments, router]);

  const signIn = useCallback(async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(app)",
    });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: session != null,
      user: session?.user ?? null,
      session: session ?? null,
      signIn,
      signOut,
    }),
    [isReady, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return value;
}
