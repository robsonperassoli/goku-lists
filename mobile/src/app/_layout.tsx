import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Slot, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import { migrateDatabase } from "@/db/migrate";
import { SyncScheduler } from "@/sync/sync-scheduler";
import { Colors } from "@/constants/theme";
import {
  getPendingInviteToken,
  setPendingInviteToken,
} from "@/lib/pending-invite";
import { extractInviteToken } from "@/lib/invite-link";

function LoadingScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor =
    Colors[colorScheme === "dark" ? "dark" : "light"].background;

  return (
    <View style={[styles.loadingScreen, { backgroundColor }]}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function AppLayout() {
  const { isPending, data: session } = authClient.useSession();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) {
        return;
      }

      const token = extractInviteToken(url);
      if (token) {
        void setPendingInviteToken(token);
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [session, isPending, segments, router]);

  React.useEffect(() => {
    if (isPending || !session) {
      return;
    }

    void (async () => {
      const pendingToken = await getPendingInviteToken();
      if (!pendingToken) {
        return;
      }

      const inInvite =
        segments[0] === "invite" && segments[1] === pendingToken;

      if (!inInvite) {
        router.replace(`/invite/${pendingToken}`);
      }
    })();
  }, [session, isPending, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingScreen />}>
            <SQLiteProvider
              databaseName="goku-lists.db"
              onInit={migrateDatabase}
              useSuspense
            >
              <SyncScheduler>
                <AnimatedSplashOverlay />
                <Slot />
              </SyncScheduler>
            </SQLiteProvider>
          </Suspense>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
