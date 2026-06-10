import { FlatList, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { ListCard } from '@/components/list-card';
import { HomeHeader } from '@/components/home-header';
import { HomeEmptyState } from '@/components/home-empty-state';
import { GrainOverlay } from '@/components/grain-overlay';
import { CreateListSheet } from '@/components/create-list-sheet';
import { useLists } from '@/hooks/lists';
import { useIncompleteTaskCounts } from '@/hooks/tasks';
import useBottomSheetBackHandler from '@/hooks/use-bottom-sheet-back-handler';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const createListSheetRef = useRef<BottomSheetModal>(null);
  useBottomSheetBackHandler(createListSheetRef);

  const { data: lists } = useLists();
  const { data: taskCounts } = useIncompleteTaskCounts();

  const countByListId = useMemo(() => {
    const map = new Map<string, number>();
    taskCounts?.forEach(({ listId, count }) => {
      map.set(listId, count);
    });
    return map;
  }, [taskCounts]);

  const openCreateList = () => {
    createListSheetRef.current?.present();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.homeBackground }]}>
      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} />
      <LinearGradient
        colors={[
          theme.homeGradientStart,
          theme.homeGradientMid,
          theme.homeGradientEnd,
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <GrainOverlay />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ListCard
              id={item.id}
              name={item.name}
              image={item.image}
              index={index}
              itemCount={countByListId.get(item.id) ?? 0}
            />
          )}
          ListHeaderComponent={
            <HomeHeader
              onAddPress={openCreateList}
              listCount={lists?.length ?? 0}
            />
          }
          ListEmptyComponent={() => (
            <HomeEmptyState onAction={openCreateList} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <CreateListSheet
        ref={createListSheetRef}
        onClose={() => createListSheetRef.current?.close()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
});
