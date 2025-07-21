// backend/scripts/update-asset-descriptions.ts
// Script to update asset descriptions by type, removing any #xxxxx suffix.
// Usage: yarn tsx scripts/update-asset-descriptions.ts

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
