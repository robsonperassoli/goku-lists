import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useColorScheme } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Slot, useRouter, useSegments } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import { migrateDatabase } from "@/db/migrate";
import { SyncScheduler } from "@/sync/sync-scheduler";

export default function AppLayout() {
  const { isPending, data: session } = authClient.useSession();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [session, isPending, segments, router]);

  if (isPending) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SQLiteProvider databaseName="goku-lists.db" onInit={migrateDatabase}>
          <QueryClientProvider client={queryClient}>
            <SyncScheduler>
              <AnimatedSplashOverlay />
              <Slot />
            </SyncScheduler>
          </QueryClientProvider>
        </SQLiteProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
