import { useEffect } from "react";
import { BackHandler } from "react-native";
import type BottomSheet from "@gorhom/bottom-sheet";

function useBottomSheetBackHandler(ref: React.RefObject<BottomSheet | null>) {
  useEffect(() => {
    const onBackPress = () => {
      ref.current?.close();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [ref]);
}

export default useBottomSheetBackHandler;
