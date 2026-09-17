import { useState, useRef } from 'react';
import { FlatList, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Crypto from 'expo-crypto';
import { SymbolView } from 'expo-symbols';

import { TaskItem } from '@/components/task-item';
import { CreateTaskSheet } from '@/components/create-task-sheet';
import { ListOptionsSheet } from '@/components/list-options-sheet';
import { ListScreenHeader } from '@/components/list-screen-header';
import { TasksEmptyState } from '@/components/tasks-empty-state';
import { GrainOverlay } from '@/components/grain-overlay';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/tasks';
import { useList, useDeleteList } from '@/hooks/lists';
import {
  useCreateInvitation,
  useLeaveList,
  useListMembership,
} from '@/hooks/sharing';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useBottomSheetBackHandler from '@/hooks/use-bottom-sheet-back-handler';
import { getListColor } from '@/lib/list-visuals';

const GROUP_RADIUS = 24;

export default function ListItems() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const listColor = getListColor(id);

  const createTaskSheetRef = useRef<BottomSheetModal>(null);
  const listOptionsSheetRef = useRef<BottomSheetModal>(null);
  useBottomSheetBackHandler(createTaskSheetRef, listOptionsSheetRef);

  const { data: list } = useList(id);
  const { data: tasks } = useTasks(id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteList = useDeleteList();
  const { data: role } = useListMembership(id);
  const createInvitation = useCreateInvitation();
  const leaveList = useLeaveList();

  const [showCompleted, setShowCompleted] = useState(false);

  const incompleteTasks = tasks?.filter((t) => !t.completedAt) ?? [];
  const completedTasks = tasks?.filter((t) => t.completedAt) ?? [];
  const isFullyEmpty = incompleteTasks.length === 0 && completedTasks.length === 0;

  const handleToggleTask = (task: {
    id: string;
    title: string;
    notes: string | null;
    completedAt: Date | null;
    position: number | null;
  }) => {
    updateTask.mutate({
      id: task.id,
      title: task.title,
      notes: task.notes ?? undefined,
      completedAt: task.completedAt ? null : new Date(),
      position: task.position ?? 0,
    });
  };

  const handleCreateTask = (title: string) => {
    createTask.mutate(
      { id: Crypto.randomUUID(), listId: id, title },
      {
        onSuccess: () => {
          createTaskSheetRef.current?.close();
        },
      },
    );
  };

  const handleLeaveList = () => {
    leaveList.mutate(id, {
      onSuccess: () => {
        listOptionsSheetRef.current?.close();
        router.back();
      },
    });
  };

  const handleCreateInvitation = async () => {
    return createInvitation.mutateAsync(id);
  };

  const handleDeleteList = () => {
    if (!list) return;

    deleteList.mutate(list.id, {
      onSuccess: () => {
        listOptionsSheetRef.current?.close();
        router.back();
      },
    });
  };

  const openListOptions = () => listOptionsSheetRef.current?.present();

  const openCreateTaskSheet = () => createTaskSheetRef.current?.present();

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
        <ListScreenHeader
          list={list}
          remainingCount={incompleteTasks.length}
          hasCompleted={completedTasks.length > 0}
          onBack={() => router.back()}
          onMore={openListOptions}
        />

        <FlatList
          data={incompleteTasks}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraData={showCompleted}
          renderItem={({ item, index }) => (
            <View
              style={[
                { backgroundColor: theme.groupSurface },
                index === 0 && styles.groupTop,
              ]}
            >
              <TaskItem
                task={item}
                onToggle={handleToggleTask}
                accentColor={listColor}
                showSeparator
              />
            </View>
          )}
          ListEmptyComponent={
            completedTasks.length === 0 ? (
              <TasksEmptyState onAction={openCreateTaskSheet} />
            ) : null
          }
          ListFooterComponent={
            <>
              {!isFullyEmpty ? (
                <View
                  style={[
                    { backgroundColor: theme.groupSurface },
                    incompleteTasks.length === 0
                      ? styles.groupSolo
                      : styles.groupBottom,
                  ]}
                >
                  <AddItemRow onPress={openCreateTaskSheet} />
                </View>
              ) : null}

              {completedTasks.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showCompleted }}
                  style={({ pressed }) => [
                    styles.completedHeader,
                    pressed && styles.pressedRow,
                  ]}
                  onPress={() => setShowCompleted((open) => !open)}
                >
                  <SymbolView
                    tintColor={theme.textLabel}
                    name={{
                      ios: showCompleted ? 'chevron.down' : 'chevron.right',
                      android: showCompleted ? 'expand_more' : 'chevron_right',
                      web: showCompleted ? 'expand_more' : 'chevron_right',
                    }}
                    size={14}
                  />
                  <Text style={[styles.completedLabel, { color: theme.textLabel }]}>
                    {`COMPLETED · ${completedTasks.length}`}
                  </Text>
                </Pressable>
              ) : null}

              {showCompleted && completedTasks.length > 0 ? (
                <View
                  style={[
                    styles.completedGroup,
                    { backgroundColor: theme.groupSurface },
                  ]}
                >
                  {completedTasks.map((item, index) => (
                    <TaskItem
                      key={item.id}
                      task={item}
                      onToggle={handleToggleTask}
                      accentColor={listColor}
                      showSeparator={index < completedTasks.length - 1}
                    />
                  ))}
                </View>
              ) : null}
            </>
          }
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>

      <CreateTaskSheet
        ref={createTaskSheetRef}
        onClose={() => createTaskSheetRef.current?.close()}
        onSubmit={handleCreateTask}
        isLoading={createTask.isPending}
      />

      <ListOptionsSheet
        ref={listOptionsSheetRef}
        listName={list?.name ?? ''}
        role={role}
        onDelete={handleDeleteList}
        onLeave={handleLeaveList}
        onCreateInvitation={handleCreateInvitation}
        isDeleting={deleteList.isPending}
        isLeaving={leaveList.isPending}
        isSharing={createInvitation.isPending}
      />
    </View>
  );
}

function AddItemRow({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel="Add item"
      accessibilityRole="button"
      style={({ pressed }) => [styles.addItemRow, pressed && styles.pressedRow]}
      onPress={onPress}
    >
      <View style={styles.addIconWrap}>
        <View
          style={[styles.addIcon, { backgroundColor: theme.backgroundElement }]}
        >
          <SymbolView
            tintColor={theme.textSecondary}
            name={{
              ios: 'plus',
              android: 'add',
              web: 'add',
            }}
            size={16}
          />
        </View>
      </View>
      <Text style={[styles.addItemLabel, { color: theme.textSecondary }]}>
        Add item
      </Text>
    </Pressable>
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
    paddingBottom: Spacing.six,
  },
  groupTop: {
    borderTopLeftRadius: GROUP_RADIUS,
    borderTopRightRadius: GROUP_RADIUS,
    overflow: 'hidden',
  },
  groupBottom: {
    borderBottomLeftRadius: GROUP_RADIUS,
    borderBottomRightRadius: GROUP_RADIUS,
    overflow: 'hidden',
  },
  groupSolo: {
    borderRadius: GROUP_RADIUS,
    overflow: 'hidden',
  },
  completedGroup: {
    borderRadius: GROUP_RADIUS,
    overflow: 'hidden',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 18,
    paddingHorizontal: Spacing.four,
  },
  addIconWrap: {
    padding: Spacing.one,
  },
  addIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemLabel: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  completedLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    fontFamily: Fonts.mono,
  },
  pressedRow: {
    opacity: 0.7,
  },
});
