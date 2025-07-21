// backend/scripts/update-asset-prices.ts
// Script to update purchasePrice for all assets by type.
// Usage: yarn tsx scripts/update-asset-prices.ts

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

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { assetsTable, assetTypeEnum } from "../lib/db/schema";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const { POSTGRES_URL } = process.env;
if (!POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set.");
}

// Create DB client and Drizzle instance
const client = postgres(POSTGRES_URL, { max: 5 });
const db = drizzle(client);

// --- Asset type to price mapping ---
// Update these values as needed
const assetPrices: Record<string, number> = {
  MOBILE_PHONE: 359.0,
  MONITOR: 149.0,
  DESKTOP: 599.0,
  LAPTOP: 1499.0,
  TABLET: 329.0,
};

async function updateAssetPrices() {
  console.log("\n🔄 Updating asset purchase prices by type...\n");
  let totalUpdated = 0;
  for (const [type, price] of Object.entries(assetPrices)) {
    // Update all assets of this type
    const result = await db
      .update(assetsTable)
      .set({ purchasePrice: price.toString() })
      .where(
        eq(assetsTable.type, type as (typeof assetTypeEnum.enumValues)[number])
      )
      .returning({ assetNumber: assetsTable.assetNumber });
    console.log(
      `  - ${type}: Set purchasePrice to £${price.toFixed(2)} for ${
        result.length
      } assets.`
    );
    totalUpdated += result.length;
  }
  console.log(`\n✅ Done. Updated purchasePrice for ${totalUpdated} assets.\n`);
}

updateAssetPrices()
  .catch((err) => {
    console.error("Error updating asset prices:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
