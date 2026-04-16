import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";

export async function migrateDatabase(expoDb: SQLite.SQLiteDatabase) {
  await expoDb.execAsync("PRAGMA journal_mode = WAL;");
  const db = drizzle(expoDb);
  await migrate(db, migrations);
}
