import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { InviteLinkHandler } from "@/components/invite-link-handler";
import { Slot } from "expo-router";
import { AuthProvider } from "@/context/auth-context";
import { queryClient } from "@/lib/query-client";
import { migrateDatabase } from "@/db/migrate";
import { SyncScheduler } from "@/sync/sync-scheduler";
import { Colors } from "@/constants/theme";

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
  const colorScheme = useColorScheme();

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
              <AuthProvider>
                <SyncScheduler>
                  <AnimatedSplashOverlay />
                  <InviteLinkHandler />
                  <Slot />
                </SyncScheduler>
              </AuthProvider>
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
