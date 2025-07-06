// backend/scripts/clear-test-data.ts
// Script to delete all test data from the database (assets in holding_assets table)
// Run with: yarn tsx scripts/clear-test-data.ts [--dry-run]

import { db } from "../lib/db";
import { holdingAssetsTable } from "../lib/db/schema";

// Check for --dry-run argument
const isDryRun = process.argv.includes("--dry-run");

async function clearTestData() {
  try {
    if (isDryRun) {
      // Dry run: count how many holding assets would be deleted
      const holdingAssets = await db.select().from(holdingAssetsTable);
      console.log(
        `DRY RUN: ${holdingAssets.length} asset(s) in holding_assets table would be deleted.`
      );
      if (holdingAssets.length > 0) {
        console.log(
          "Sample serial numbers:",
          holdingAssets.slice(0, 5).map((a) => a.serialNumber)
        );
      }
      console.log(
        "No data was deleted. To actually delete, run without --dry-run."
      );
    } else {
      // Actual deletion: delete all rows from holding_assets table
      await db.delete(holdingAssetsTable);
      // Note: drizzle-orm may not return affected row count, so you may want to count before deleting
      console.log("All assets deleted from holding_assets table.");
    }
  } catch (err) {
    console.error("Error deleting test data:", err);
    process.exit(1);
  }
  process.exit(0);
}

clearTestData();
