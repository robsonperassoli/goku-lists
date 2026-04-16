import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";

const expo = SQLite.openDatabaseSync("goku-lists.db");
const db = drizzle(expo);

expo.execSync("SELECT 1");

await migrate(db, migrations);

export { db };
