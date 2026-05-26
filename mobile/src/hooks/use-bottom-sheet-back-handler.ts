import { useEffect } from "react";
import { BackHandler } from "react-native";
import type BottomSheet from "@gorhom/bottom-sheet";

function useBottomSheetBackHandler(
  ...refs: React.RefObject<BottomSheet | null>[]
) {
  useEffect(() => {
    const onBackPress = () => {
      refs.forEach((ref) => ref.current?.close());
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [refs]);
}

export default useBottomSheetBackHandler;
