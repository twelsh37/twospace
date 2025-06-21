// backend/lib/db/seed.ts
// Standalone seed script with explicit connection management.

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, ne } from "drizzle-orm";

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
  assetTypeEnum,
} from "./schema";

// Explicitly load .env.local for this script
dotenv.config({ path: ".env.local" });

const { POSTGRES_URL } = process.env;

if (!POSTGRES_URL) {
  throw new Error("🔴 POSTGRES_URL environment variable is not set.");
}

// Create a new, dedicated client for the seed script
const client = postgres(POSTGRES_URL, { max: 10 }); // Increase pool size for seeding
const db = drizzle(client, { schema });

// --- Data for random generation ---
const MALE_FIRST_NAMES = [
  "John",
  "Peter",
  "Mike",
  "David",
  "Chris",
  "James",
  "Robert",
  "Daniel",
  "Paul",
  "Mark",
];
const FEMALE_FIRST_NAMES = [
  "Mary",
  "Jennifer",
  "Linda",
  "Patricia",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Nancy",
  "Lisa",
];
const LAST_NAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
];
const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Customer Support",
  "Operations",
];

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // --- Stage 1: Clean Slate ---
    console.log("   - Clearing previously seeded data for a clean run...");
    await db.delete(assetHistoryTable);
    await db.delete(assetsTable);
    // Keep the admin user for future reference if needed
    await db.delete(usersTable).where(ne(usersTable.role, "ADMIN"));
    console.log("   - Previous data cleared.");

    console.log("   - Resetting all asset sequences to 1...");
    await db.update(assetSequencesTable).set({ nextSequence: 1 });

    // --- Stage 2: Seed Foundational Data ---
    console.log("   - Seeding foundational data (locations, admin user)...");
    // (Locations and Sequences are idempotent due to onConflictDoNothing in original script)
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
        name: "IT Department",
        description: "IT support and asset management office",
      },
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

    // --- Stage 3: Seed Users (1200) ---
    console.log("   - Preparing to seed 1200 users...");
    const usersToInsert: NewUser[] = [];

    // Create 12 IT Department users
    for (let i = 0; i < 12; i++) {
      const gender = Math.random() > 0.5 ? "male" : "female";
      const firstName =
        gender === "male"
          ? MALE_FIRST_NAMES[i % MALE_FIRST_NAMES.length]
          : FEMALE_FIRST_NAMES[i % FEMALE_FIRST_NAMES.length];
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      usersToInsert.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.it@company.com`,
        employeeId: `IT${String(1000 + i).padStart(4, "0")}`,
        department: "IT Department",
        role: "USER",
      });
    }

    // Create 1188 other users
    for (let i = 0; i < 1188; i++) {
      const gender = Math.random() > 0.5 ? "male" : "female";
      const firstName =
        gender === "male"
          ? MALE_FIRST_NAMES[i % MALE_FIRST_NAMES.length]
          : FEMALE_FIRST_NAMES[i % FEMALE_FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i + 5) % LAST_NAMES.length]; // Offset to vary names
      usersToInsert.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
        employeeId: `EMP${String(1000 + i).padStart(4, "0")}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        role: "USER",
      });
    }

    // Insert users in batches
    const USER_BATCH_SIZE = 50;
    for (let i = 0; i < usersToInsert.length; i += USER_BATCH_SIZE) {
      const batch = usersToInsert.slice(i, i + USER_BATCH_SIZE);
      console.log(
        `     - 👤 Inserting user batch ${i / USER_BATCH_SIZE + 1}...`
      );
      await db.insert(usersTable).values(batch).onConflictDoNothing();
    }
    console.log("   - All users seeded successfully.");

    // --- Stage 4: Comprehensive Asset Seeding (1234) ---
    console.log("   - Seeding 1234 comprehensive assets with batching...");

    const [allLocations, allUsers, currentSequences] = await Promise.all([
      db.query.locationsTable.findMany(),
      db.query.usersTable.findMany({ where: eq(usersTable.role, "USER") }),
      db.query.assetSequencesTable.findMany(),
    ]);

    const adminUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.role, "ADMIN"),
    });
    if (!adminUser) throw new Error("Admin user not found!");

    // Define asset distribution
    const assetDistribution = {
      TABLET: 247,
      DESKTOP: 309,
      MONITOR: 309,
      LAPTOP: 185,
      MOBILE_PHONE: 185,
    };

    const assetBlueprints: {
      type: (typeof assetTypeEnum.enumValues)[number];
    }[] = [];
    for (const [type, count] of Object.entries(assetDistribution)) {
      for (let i = 0; i < count; i++) {
        assetBlueprints.push({
          type: type as (typeof assetTypeEnum.enumValues)[number],
        });
      }
    }

    // Use a reliable mapping for prefixes
    const assetTypePrefixes: Record<
      (typeof assetTypeEnum.enumValues)[number],
      string
    > = {
      MOBILE_PHONE: "01",
      TABLET: "02",
      DESKTOP: "03",
      LAPTOP: "04",
      MONITOR: "05",
    };

    const sequenceMap = new Map(
      currentSequences.map((s) => [s.assetType, s.nextSequence])
    );
    const ASSET_BATCH_SIZE = 50;

    for (let i = 0; i < assetBlueprints.length; i += ASSET_BATCH_SIZE) {
      const batch = assetBlueprints.slice(i, i + ASSET_BATCH_SIZE);
      const assetsToInsert: NewAsset[] = [];
      console.log(
        `     - 📦 Generating asset batch ${i / ASSET_BATCH_SIZE + 1}...`
      );

      for (const blueprint of batch) {
        const { type } = blueprint;
        const prefix = assetTypePrefixes[type];
        const currentSequence = sequenceMap.get(type) || 1;
        const assetNumber = `${prefix}-${String(currentSequence).padStart(
          5,
          "0"
        )}`;
        sequenceMap.set(type, currentSequence + 1);

        let asset: NewAsset = {
          assetNumber,
          type,
          state: "AVAILABLE",
          serialNumber: `SN-${type.slice(0, 2)}-${Math.random()
            .toString(36)
            .substring(2, 9)
            .toUpperCase()}`,
          description: `Seeded ${type} #${currentSequence}`,
          purchasePrice: (Math.random() * 1500 + 300).toFixed(2),
          locationId:
            allLocations[Math.floor(Math.random() * allLocations.length)].id,
          assignmentType: "INDIVIDUAL", // Default to individual
        };

        // Randomly assign ~60% of assets to users
        if (Math.random() < 0.6 && allUsers.length > 0) {
          const randomUser =
            allUsers[Math.floor(Math.random() * allUsers.length)];
          asset = {
            ...asset,
            state: "ISSUED",
            assignedTo: randomUser.name,
            employeeId: randomUser.employeeId,
            department: randomUser.department,
          };
        }
        assetsToInsert.push(asset);
      }

      if (assetsToInsert.length > 0) {
        console.log(`     - Inserting ${assetsToInsert.length} assets...`);
        const insertedAssets = await db
          .insert(assetsTable)
          .values(assetsToInsert)
          .returning({
            assetNumber: assetsTable.assetNumber,
            state: assetsTable.state,
          });

        const historyToInsert = insertedAssets.map((asset) => ({
          assetId: asset.assetNumber,
          newState: asset.state,
          changedBy: adminUser.id,
          changeReason: "Asset created during database seeding.",
        }));
        await db.insert(assetHistoryTable).values(historyToInsert);
      }
    }

    // --- Stage 5: Update Sequences ---
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
    throw error;
  } finally {
    console.log("   - Closing database connection...");
    await client.end();
  }
}

// --- Main execution ---
seedDatabase().catch((err) => {
  console.error(
    "A critical error occurred during seeding. Process will exit.",
    err
  );
  process.exit(1);
});
