// frontend/scripts/update-enum.js

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

// Script to update asset_status enum from 'retired' to 'recycled'

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load environment variables
dotenv.config({ path: ".env.local" });

const { POSTGRES_URL } = process.env;
if (!POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set.");
}

const client = postgres(POSTGRES_URL, {
  max: 5,
  ssl: { rejectUnauthorized: false }, // Disable SSL verification
});
const db = drizzle(client);

async function updateAssetStatusEnum() {
  try {
    console.log("Updating asset_status enum from 'retired' to 'recycled'...");

    // Step 1: Convert enum columns to text temporarily
    console.log("Step 1: Converting enum columns to text...");
    await client`
      ALTER TABLE assets ALTER COLUMN status TYPE text
    `;
    console.log("✅ Converted assets.status to text");

    await client`
      ALTER TABLE archived_assets ALTER COLUMN status TYPE text
    `;
    console.log("✅ Converted archived_assets.status to text");

    // Step 2: Update any existing 'retired' values to 'recycled'
    console.log("Step 2: Updating 'retired' values to 'recycled'...");
    const assetsResult = await client`
      UPDATE assets SET status = 'recycled' WHERE status = 'retired'
    `;
    console.log(`✅ Updated ${assetsResult.count} rows in assets table`);

    const archivedResult = await client`
      UPDATE archived_assets SET status = 'recycled' WHERE status = 'retired'
    `;
    console.log(
      `✅ Updated ${archivedResult.count} rows in archived_assets table`
    );

    // Step 3: Drop the old enum type
    console.log("Step 3: Dropping old enum type...");
    await client`DROP TYPE IF EXISTS asset_status`;
    console.log("✅ Dropped old enum type");

    // Step 4: Create the new enum type with 'recycled' instead of 'retired'
    console.log("Step 4: Creating new enum type...");
    await client`
      CREATE TYPE asset_status AS ENUM('holding', 'active', 'recycled', 'stock')
    `;
    console.log("✅ Created new enum type with 'recycled'");

    // Step 5: Convert columns back to enum type
    console.log("Step 5: Converting columns back to enum type...");
    await client`
      ALTER TABLE assets ALTER COLUMN status TYPE asset_status USING status::asset_status
    `;
    console.log("✅ Updated assets table column type");

    await client`
      ALTER TABLE archived_assets ALTER COLUMN status TYPE asset_status USING status::asset_status
    `;
    console.log("✅ Updated archived_assets table column type");

    // Step 6: Set default values
    console.log("Step 6: Setting default values...");
    await client`ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'holding'`;
    await client`ALTER TABLE archived_assets ALTER COLUMN status SET DEFAULT 'holding'`;
    console.log("✅ Set default values");

    console.log(
      "🎉 Successfully updated asset_status enum from 'retired' to 'recycled'!"
    );
  } catch (error) {
    console.error("❌ Error updating enum:", error);
  } finally {
    await client.end();
  }
}

updateAssetStatusEnum();
