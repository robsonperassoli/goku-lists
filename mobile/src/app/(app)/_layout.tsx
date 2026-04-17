import React from "react";

import { Slot, Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "@/hooks/use-theme";
import { View } from "react-native";

export default function RootLayout() {
  const theme = useTheme();
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              // statusBarHidden: true,
              // navigationBarHidden: true,
              animation: "ios_from_right",
              contentStyle: { backgroundColor: theme.background },
            }}
          />
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
