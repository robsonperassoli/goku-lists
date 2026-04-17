import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useColorScheme } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Slot, useRouter, useSegments } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { migrateDatabase } from "@/db/migrate";

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <SQLiteProvider databaseName="goku-lists.db" onInit={migrateDatabase}>
            <AnimatedSplashOverlay />
            <Slot />
          </SQLiteProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
