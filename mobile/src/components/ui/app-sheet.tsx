import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { type RefObject, type ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type AppSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  children: ReactNode;
  contentStyle?: BottomSheetModalProps["style"];
} & Pick<
  BottomSheetModalProps,
  | "enableDynamicSizing"
  | "keyboardBehavior"
  | "keyboardBlurBehavior"
  | "onDismiss"
>;

export function AppSheet({
  ref,
  children,
  contentStyle,
  enableDynamicSizing,
  keyboardBehavior,
  keyboardBlurBehavior,
  onDismiss,
}: AppSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing={enableDynamicSizing}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={keyboardBlurBehavior}
      onDismiss={onDismiss}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.7}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={{
        backgroundColor: theme.surfaceHigh,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.backgroundSelected }}
    >
      <BottomSheetView>
        <SafeAreaView style={[{ padding: Spacing.four }, contentStyle]}>
          {children}
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
