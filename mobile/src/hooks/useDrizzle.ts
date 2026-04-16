import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

export function useDrizzle() {
  const db = useSQLiteContext();
  return useMemo(() => drizzle(db), [db]);
}
