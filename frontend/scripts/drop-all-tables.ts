// backend/scripts/drop-all-tables.ts
// Script to drop all tables and enums from the database using Drizzle ORM
// Run with: yarn tsx scripts/drop-all-tables.ts

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
