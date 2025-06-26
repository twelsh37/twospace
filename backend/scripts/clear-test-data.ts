// backend/scripts/clear-test-data.ts
// Script to delete all test data from the database (assets in holding status)
// Run with: yarn tsx scripts/clear-test-data.ts

import { db } from "../lib/db";
import { assetsTable } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function clearTestData() {
  try {
    // Delete only assets in holding status
    await db.delete(assetsTable).where(eq(assetsTable.status, "holding"));
    console.log("All test/holding assets deleted from assets table.");
  } catch (err) {
    console.error("Error deleting test data:", err);
    process.exit(1);
  }
  process.exit(0);
}

clearTestData();
