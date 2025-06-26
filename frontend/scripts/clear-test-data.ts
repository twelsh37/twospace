// backend/scripts/clear-test-data.ts
// Script to delete all test data from the database (assets in holding status)
// Run with: yarn tsx scripts/clear-test-data.ts [--dry-run]

import { db } from "../lib/db";
import { assetsTable } from "../lib/db/schema";
import { eq } from "drizzle-orm";

// Check for --dry-run argument
const isDryRun = process.argv.includes("--dry-run");

async function clearTestData() {
  try {
    if (isDryRun) {
      // Dry run: count how many assets would be deleted
      const holdingAssets = await db
        .select()
        .from(assetsTable)
        .where(eq(assetsTable.status, "holding"));
      console.log(
        `DRY RUN: ${holdingAssets.length} asset(s) with status 'holding' would be deleted.`
      );
      if (holdingAssets.length > 0) {
        console.log(
          "Sample asset numbers:",
          holdingAssets.slice(0, 5).map((a) => a.assetNumber)
        );
      }
      console.log(
        "No data was deleted. To actually delete, run without --dry-run."
      );
    } else {
      // Actual deletion
      await db.delete(assetsTable).where(eq(assetsTable.status, "holding"));
      // Note: drizzle-orm may not return affected row count, so you may want to count before deleting
      console.log("All test/holding assets deleted from assets table.");
    }
  } catch (err) {
    console.error("Error deleting test data:", err);
    process.exit(1);
  }
  process.exit(0);
}

clearTestData();
