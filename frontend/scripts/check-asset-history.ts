#!/usr/bin/env tsx

// frontend/scripts/check-asset-history.ts

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

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Check Asset History Script
 * Shows the history of a specific asset
 */

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { assetsTable, assetHistoryTable } from "../lib/db/schema";

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL =
  process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !DATABASE_URL) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

/**
 * Check asset history
 */
async function checkAssetHistory(assetNumber: string) {
  console.log(`🔍 Checking history for asset: ${assetNumber}`);

  try {
    // Get asset
    const asset = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.assetNumber, assetNumber))
      .limit(1);

    if (asset.length === 0) {
      console.error(`❌ Asset ${assetNumber} not found`);
      return;
    }

    const assetData = asset[0];
    console.log(`\n📦 Asset Information:`);
    console.log(`   Asset Number: ${assetData.assetNumber}`);
    console.log(`   Type: ${assetData.type}`);
    console.log(`   Current State: ${assetData.state}`);
    console.log(`   Description: ${assetData.description}`);

    // Get history
    const history = await db
      .select()
      .from(assetHistoryTable)
      .where(eq(assetHistoryTable.assetId, assetData.id))
      .orderBy(assetHistoryTable.timestamp);

    console.log(`\n📜 Asset History (${history.length} entries):`);

    if (history.length === 0) {
      console.log(`   No history entries found`);
      return;
    }

    history.forEach((entry, index) => {
      const timestamp = entry.timestamp
        ? new Date(entry.timestamp).toLocaleString()
        : "Unknown";
      console.log(
        `\n   ${index + 1}. ${entry.previousState || "N/A"} → ${entry.newState}`
      );
      console.log(`      By: ${entry.changedBy}`);
      console.log(`      Reason: ${entry.changeReason}`);
      console.log(`      Time: ${timestamp}`);

      if (entry.details && typeof entry.details === "string") {
        try {
          const details = JSON.parse(entry.details);
          if (details.fixReason) {
            console.log(`      Fix: ${details.fixReason}`);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
  } catch (error) {
    console.error(
      "❌ Error checking asset history:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Get asset number from command line
const assetNumber = process.argv[2];

if (!assetNumber) {
  console.error("❌ Please provide an asset number");
  console.error("Usage: yarn check-asset-history <asset-number>");
  process.exit(1);
}

// Run the check
checkAssetHistory(assetNumber).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
