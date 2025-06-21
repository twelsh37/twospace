// backend/lib/db/seed.ts
// Standalone seed script with explicit connection management.

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

import * as schema from "./schema";
import {
  NewUser,
  NewLocation,
  NewAsset,
  usersTable,
  locationsTable,
  assetSequencesTable,
  assetsTable,
  assetHistoryTable,
} from "./schema";

// Explicitly load .env.local for this script
dotenv.config({ path: ".env.local" });

const { POSTGRES_URL } = process.env;

if (!POSTGRES_URL) {
  throw new Error("🔴 POSTGRES_URL environment variable is not set.");
}

// Create a new, dedicated client for the seed script
const client = postgres(POSTGRES_URL, { max: 1 });
const db = drizzle(client, { schema });

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Stage 1: Seed foundational data (users, locations)
    console.log("   - Seeding foundational data (if necessary)...");

    // These are wrapped in onConflictDoNothing to be idempotent.
    await db
      .insert(assetSequencesTable)
      .values([
        { assetType: "MOBILE_PHONE", nextSequence: 1 },
        { assetType: "TABLET", nextSequence: 1 },
        { assetType: "DESKTOP", nextSequence: 1 },
        { assetType: "LAPTOP", nextSequence: 1 },
        { assetType: "MONITOR", nextSequence: 1 },
      ])
      .onConflictDoNothing();

    const locations: NewLocation[] = [
      {
        name: "Headquarters - Floor 1",
        description: "Main floor with reception and meeting rooms",
      },
      {
        name: "Headquarters - Floor 2",
        description: "Engineering and development teams",
      },
      {
        name: "Headquarters - Floor 3",
        description: "Management and administrative offices",
      },
      {
        name: "Branch Office - North",
        description: "Northern branch location",
      },
      {
        name: "Branch Office - South",
        description: "Southern branch location",
      },
      {
        name: "Warehouse - Main",
        description: "Primary storage and distribution center",
      },
      {
        name: "IT Department",
        description: "IT support and asset management office",
      },
      { name: "Reception Area", description: "Main building reception" },
      { name: "Conference Room A", description: "Large conference room" },
      { name: "Storage Room", description: "General storage facility" },
    ];
    await db.insert(locationsTable).values(locations).onConflictDoNothing();

    const adminUserData: NewUser = {
      name: "System Administrator",
      email: "admin@company.com",
      employeeId: "ADMIN001",
      department: "IT Department",
      role: "ADMIN",
    };
    await db.insert(usersTable).values(adminUserData).onConflictDoNothing();

    // --- Stage 2: Clean and Reseed Assets ---
    console.log("   - Clearing previously seeded assets for a clean run...");
    await db.delete(assetHistoryTable);
    await db.delete(assetsTable);
    console.log("   - Previous asset data cleared.");

    console.log("   - Resetting all asset sequences to 1...");
    await db.update(assetSequencesTable).set({ nextSequence: 1 });

    // --- Stage 3: Comprehensive Asset Seeding ---
    console.log("   - Seeding comprehensive assets with batching...");

    const [allLocations, adminUser, currentSequences] = await Promise.all([
      db.query.locationsTable.findMany(),
      db.query.usersTable.findFirst({ where: eq(usersTable.role, "ADMIN") }),
      db.query.assetSequencesTable.findMany(),
    ]);

    if (!adminUser || allLocations.length === 0) {
      throw new Error(
        "Could not find admin user or locations to create assets."
      );
    }

    const assetTypes: NewAsset["type"][] = [
      "MOBILE_PHONE",
      "LAPTOP",
      "MONITOR",
      "DESKTOP",
      "TABLET",
    ];
    const assetTypePrefixes: Record<NewAsset["type"], string> = {
      MOBILE_PHONE: "01",
      TABLET: "02",
      DESKTOP: "03",
      LAPTOP: "04",
      MONITOR: "05",
    };
    const sequenceMap = new Map(
      currentSequences.map((s) => [s.assetType, s.nextSequence])
    );
    const TOTAL_ASSETS = 250;
    const BATCH_SIZE = 50;
    console.log(
      `   - Preparing to generate and insert ${TOTAL_ASSETS} assets in batches of ${BATCH_SIZE}...`
    );

    for (let i = 0; i < TOTAL_ASSETS; i += BATCH_SIZE) {
      const assetsToInsert: NewAsset[] = [];
      const batchEnd = Math.min(i + BATCH_SIZE, TOTAL_ASSETS);
      console.log(
        `     - Generating batch ${i / BATCH_SIZE + 1}: assets ${
          i + 1
        } to ${batchEnd}`
      );

      for (let j = i; j < batchEnd; j++) {
        const type = assetTypes[j % assetTypes.length];
        const location = allLocations[j % allLocations.length];
        const prefix = assetTypePrefixes[type];
        const currentSequence = sequenceMap.get(type) || 1;
        const assetNumber = `${prefix}-${String(currentSequence).padStart(
          5,
          "0"
        )}`;
        sequenceMap.set(type, currentSequence + 1);

        const asset: NewAsset = {
          assetNumber,
          type,
          state: "AVAILABLE",
          serialNumber: `SN-${type.slice(0, 2)}-${Math.random()
            .toString(36)
            .substring(2, 9)
            .toUpperCase()}`,
          description: `Seeded ${type} #${currentSequence}`,
          purchasePrice: (Math.random() * 1500 + 300).toFixed(2),
          locationId: location.id,
          assignmentType: "INDIVIDUAL",
        };
        assetsToInsert.push(asset);
      }

      if (assetsToInsert.length > 0) {
        console.log(`     - 📦 Inserting ${assetsToInsert.length} assets...`);
        const insertedAssets = await db
          .insert(assetsTable)
          .values(assetsToInsert)
          .returning({
            assetNumber: assetsTable.assetNumber,
            state: assetsTable.state,
          });

        console.log(
          `     - 📜 Inserting ${insertedAssets.length} history records...`
        );
        const historyToInsert = insertedAssets.map((asset) => ({
          assetId: asset.assetNumber,
          newState: asset.state,
          changedBy: adminUser.id,
          changeReason: "Asset created during database seeding.",
        }));
        await db.insert(assetHistoryTable).values(historyToInsert);
      }
    }

    console.log("   - 💾 Updating final asset sequence numbers...");
    for (const [assetType, nextSequence] of sequenceMap.entries()) {
      await db
        .update(assetSequencesTable)
        .set({ nextSequence })
        .where(eq(assetSequencesTable.assetType, assetType));
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error; // Rethrow to ensure script exits with an error code
  } finally {
    console.log("   - Closing database connection...");
    await client.end(); // Ensure connection is always closed
  }
}

// --- Main execution ---
seedDatabase().catch(() => {
  // The error is already logged in the catch block of seedDatabase
  // We call catch here to prevent an unhandled promise rejection warning
  // and ensure the process exits with a failure code.
  process.exit(1);
});
