// backend/scripts/update-asset-descriptions.ts
// Script to update asset descriptions by type, removing any #xxxxx suffix.
// Usage: yarn tsx scripts/update-asset-descriptions.ts

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { assetsTable } from "../lib/db/schema";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const { POSTGRES_URL } = process.env;
if (!POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set.");
}

// Create DB client and Drizzle instance
const client = postgres(POSTGRES_URL, { max: 5 });
const db = drizzle(client);

// --- Asset type to description mapping ---
const assetDescriptions: Record<
  "MONITOR" | "MOBILE_PHONE" | "DESKTOP" | "LAPTOP",
  string
> = {
  MONITOR: "24in Dell Monitor",
  MOBILE_PHONE: "Samsung Galaxy A34",
  DESKTOP: "Dell Optiplex 7101",
  LAPTOP: "Dell Lattitude 7430",
};

async function updateAssetDescriptions() {
  console.log("\n🔄 Updating asset descriptions by type...\n");
  let totalUpdated = 0;
  for (const [type, description] of Object.entries(assetDescriptions)) {
    // Update all assets of this type
    const result = await db
      .update(assetsTable)
      .set({ description })
      .where(
        eq(
          assetsTable.type,
          type as "MONITOR" | "MOBILE_PHONE" | "DESKTOP" | "LAPTOP"
        )
      )
      .returning({ assetNumber: assetsTable.assetNumber });
    console.log(
      `  - ${type}: Set description to '${description}' for ${result.length} assets.`
    );
    totalUpdated += result.length;
  }
  console.log(`\n✅ Done. Updated descriptions for ${totalUpdated} assets.\n`);
}

updateAssetDescriptions()
  .catch((err) => {
    console.error("Error updating asset descriptions:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
