import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { migrationsFolder } from "../../drizzle.config";
import { db } from ".";

migrate(db, { migrationsFolder });
