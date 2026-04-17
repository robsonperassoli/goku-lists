import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListCard } from "@/components/list-card";
import { EmptyState } from "@/components/empty-state";
import { ThemedView } from "@/components/themed-view";
import { HomeHeader } from "@/components/home-header";
import { useLists } from "@/hooks/lists";
import { BottomTabInset } from "@/constants/theme";
import type { List } from "@/db/schema";
import { CreateListSheet } from "@/components/create-list-sheet";
import { useRef } from "react";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import useBottomSheetBackHandler from "@/hooks/use-bottom-sheet-back-handler";

export default function HomeScreen() {
  const createTaskSheetRef = useRef<BottomSheetModal>(null);
  useBottomSheetBackHandler(createTaskSheetRef);

  const { data: lists } = useLists();

  const renderItem = ({ item }: { item: List }) => (
    <ListCard id={item.id} name={item.name} description={item.description} />
  );

  const renderEmpty = () => (
    <EmptyState
      message="No lists yet"
      actionLabel="Create List"
      onAction={() => console.log("quak")}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <HomeHeader
          onAddPress={() => {
            createTaskSheetRef.current?.present();
          }}
        />

        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>

      <CreateListSheet
        ref={createTaskSheetRef}
        onClose={() => createTaskSheetRef.current?.close()}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset,
  },
});
