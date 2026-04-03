import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { useColorScheme } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Slot, useRouter, useSegments } from "expo-router";
import { authClient } from "@/lib/auth-client";

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
  }, [session, isPending, segments, router.replace]);

  if (isPending) return null; // or a splash/loader

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Slot />
    </ThemeProvider>
  );
}
