// backend/scripts/clear-test-data.ts

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
