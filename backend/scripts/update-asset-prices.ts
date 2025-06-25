// backend/scripts/update-asset-prices.ts
// Script to update purchasePrice for all assets by type.
// Usage: yarn tsx scripts/update-asset-prices.ts

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
      .set({ purchasePrice: price })
      .where(eq(assetsTable.type, type))
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
