// backend/scripts/drop-all-tables.ts
// Script to drop all tables and enums from the database using Drizzle ORM
// Run with: yarn tsx scripts/drop-all-tables.ts

import { db, closeConnection } from "../lib/db";
import { sql } from "drizzle-orm";

async function dropAllTables() {
  try {
    // Drop tables in order due to foreign key constraints
    await db.execute(sql`DROP TABLE IF EXISTS asset_assignments CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS asset_history CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS assets CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS locations CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS asset_sequences CASCADE;`);

    // Drop enums
    await db.execute(sql`DROP TYPE IF EXISTS asset_status CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS asset_state CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS asset_type CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS assignment_type CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS user_role CASCADE;`);

    console.log("All tables and enums dropped successfully.");
  } catch (err) {
    console.error("Error dropping tables:", err);
    process.exit(1);
  } finally {
    await closeConnection();
  }
  process.exit(0);
}

dropAllTables();
