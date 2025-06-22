// backend/lib/db/seed.ts
// Standalone seed script for generating a large, realistic dataset.

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, ne } from "drizzle-orm";
import * as schema from "./schema";

const {
  usersTable,
  locationsTable,
  assetSequencesTable,
  assetsTable,
  assetHistoryTable,
  assetTypeEnum,
} = schema;

type AssetBlueprint = {
  type: (typeof assetTypeEnum.enumValues)[number];
  assignedToUser?: schema.User;
};

// --- Configuration ---
const TOTAL_USERS = 12000;
const BATCH_SIZE = 500; // Increased batch size for performance with large datasets
const LAPTOP_RATIO = 0.75;
const DESKTOP_RATIO = 0.24;
const TABLET_RATIO = 0.37;
const STOCK_RATIO = 0.1;

// Explicitly load .env.local for this script
dotenv.config({ path: ".env.local" });

const { POSTGRES_URL } = process.env;
if (!POSTGRES_URL) {
  throw new Error("🔴 POSTGRES_URL environment variable is not set.");
}

const client = postgres(POSTGRES_URL, { max: 20 }); // Increase pool size for seeding
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
  "Steven",
  "Kevin",
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
  "Betty",
  "Dorothy",
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
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
];
const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Customer Support",
  "Operations",
  "Legal",
  "Research",
];

// --- Helper Functions ---
const shuffleArray = <T>(array: T[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

async function seedDatabase() {
  console.log("🌱 Starting database seed for a large company...");
  console.log(`   - Users to create: ${TOTAL_USERS}`);

  try {
    // --- Stage 1: Clean Slate ---
    console.log("\n--- Stage 1: Cleaning Database ---");
    try {
      await db.delete(assetHistoryTable);
      await db.delete(assetsTable);
      await db.delete(usersTable).where(ne(usersTable.role, "ADMIN"));
      await db.update(assetSequencesTable).set({ nextSequence: 1 });
      console.log("   ✓ Previous data cleared and sequences reset.");
    } catch (error: unknown) {
      console.warn(
        "   - Warning: Could not clear all previous data. This is expected if tables do not exist yet."
      );
      if (error instanceof Error) {
        console.log("     Original error:", error.message);
      }
    }

    // --- Stage 2: Seed Foundational Data ---
    console.log("\n--- Stage 2: Seeding Foundational Data ---");
    const locationsToSeed: schema.NewLocation[] = [
      { name: "Headquarters", description: "Main Company Headquarters" },
      {
        name: "IT Department",
        description: "IT support and asset management office",
      },
      { name: "IT Department - store room", description: "IT Store room" },
      { name: "London Office", description: "UK Branch" },
      { name: "New York Office", description: "US Branch" },
    ];
    await db
      .insert(locationsTable)
      .values(locationsToSeed)
      .onConflictDoNothing();

    await db
      .insert(usersTable)
      .values({
        name: "System Administrator",
        email: "admin@company.com",
        employeeId: "ADMIN001",
        department: "IT Department",
        role: "ADMIN",
      })
      .onConflictDoNothing();
    console.log("   ✓ Locations and admin user seeded.");

    // --- Stage 3: Generate and Insert Users ---
    console.log(`\n--- Stage 3: Generating ${TOTAL_USERS} Users ---`);
    const usersToInsert: schema.NewUser[] = [];
    const emailCounts: { [key: string]: number } = {}; // To track duplicate names

    for (let i = 0; i < TOTAL_USERS; i++) {
      const gender = Math.random() > 0.5 ? "male" : "female";
      const firstName =
        gender === "male"
          ? MALE_FIRST_NAMES[i % MALE_FIRST_NAMES.length]
          : FEMALE_FIRST_NAMES[i % FEMALE_FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i + 5) % LAST_NAMES.length];

      // Create unique email address based on new format
      const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      const count = emailCounts[baseUsername] || 0;
      const finalUsername =
        count === 0 ? baseUsername : `${baseUsername}${count}`;
      const email = `${finalUsername}@theaiaa.com`;
      emailCounts[baseUsername] = count + 1;

      usersToInsert.push({
        name: `${firstName} ${lastName}`,
        email: email,
        employeeId: `EMP${String(10000 + i).padStart(5, "0")}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        role: "USER",
      });
    }

    for (let i = 0; i < usersToInsert.length; i += BATCH_SIZE) {
      const batch = usersToInsert.slice(i, i + BATCH_SIZE);
      console.log(
        `   - 👤 Inserting user batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          usersToInsert.length / BATCH_SIZE
        )}...`
      );
      await db.insert(usersTable).values(batch);
    }
    console.log("   ✓ All users seeded successfully.");

    // --- Stage 4: Generate Asset Blueprints ---
    console.log("\n--- Stage 4: Generating Asset Blueprints ---");
    const allUsers = await db.query.usersTable.findMany({
      where: eq(usersTable.role, "USER"),
    });

    const issuedCounts = {
      MOBILE_PHONE: TOTAL_USERS,
      LAPTOP: Math.floor(TOTAL_USERS * LAPTOP_RATIO),
      DESKTOP: Math.floor(TOTAL_USERS * DESKTOP_RATIO),
      MONITOR:
        Math.floor(TOTAL_USERS * LAPTOP_RATIO + TOTAL_USERS * DESKTOP_RATIO) *
        2,
      TABLET: Math.floor(TOTAL_USERS * TABLET_RATIO),
    };

    const stockCounts = {
      MOBILE_PHONE: Math.ceil(issuedCounts.MOBILE_PHONE * STOCK_RATIO),
      LAPTOP: Math.ceil(issuedCounts.LAPTOP * STOCK_RATIO),
      DESKTOP: Math.ceil(issuedCounts.DESKTOP * STOCK_RATIO),
      MONITOR: Math.ceil(issuedCounts.MONITOR * STOCK_RATIO),
      TABLET: Math.ceil(issuedCounts.TABLET * STOCK_RATIO),
    };

    const assetBlueprints: AssetBlueprint[] = [];

    // Create blueprints for issued assets
    shuffleArray(allUsers); // Randomize user order
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      assetBlueprints.push({ type: "MOBILE_PHONE", assignedToUser: user });
      if (i < issuedCounts.LAPTOP)
        assetBlueprints.push({ type: "LAPTOP", assignedToUser: user });
      if (i < issuedCounts.DESKTOP)
        assetBlueprints.push({ type: "DESKTOP", assignedToUser: user });
      if (i < issuedCounts.TABLET)
        assetBlueprints.push({ type: "TABLET", assignedToUser: user });
    }
    // Add monitors for laptops and desktops
    const laptopAndDesktopUsers = allUsers.slice(
      0,
      Math.max(issuedCounts.LAPTOP, issuedCounts.DESKTOP)
    );
    for (const user of laptopAndDesktopUsers) {
      if (
        assetBlueprints.filter(
          (b) =>
            b.assignedToUser === user &&
            (b.type === "LAPTOP" || b.type === "DESKTOP")
        ).length > 0
      ) {
        assetBlueprints.push({ type: "MONITOR", assignedToUser: user });
        assetBlueprints.push({ type: "MONITOR", assignedToUser: user });
      }
    }

    // Create blueprints for stock assets
    for (const [type, count] of Object.entries(stockCounts)) {
      for (let i = 0; i < count; i++) {
        assetBlueprints.push({
          type: type as (typeof assetTypeEnum.enumValues)[number],
        });
      }
    }

    shuffleArray(assetBlueprints);
    console.log(
      `   ✓ Total asset blueprints created: ${assetBlueprints.length}`
    );

    // --- Stage 5: Create and Insert Assets from Blueprints ---
    console.log("\n--- Stage 5: Creating and Inserting Assets ---");
    const itStoreRoom = await db.query.locationsTable.findFirst({
      where: eq(locationsTable.name, "IT Department - store room"),
    });
    const officeLocations = await db.query.locationsTable.findMany({
      where: ne(locationsTable.name, "IT Department - store room"),
    });
    const adminUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.role, "ADMIN"),
    });
    if (!itStoreRoom || !adminUser || officeLocations.length === 0) {
      throw new Error("Could not find required locations or Admin User");
    }

    const sequenceMap = new Map(assetTypeEnum.enumValues.map((e) => [e, 1]));
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

    for (let i = 0; i < assetBlueprints.length; i += BATCH_SIZE) {
      const batchBlueprints = assetBlueprints.slice(i, i + BATCH_SIZE);
      const assetsToInsert: schema.NewAsset[] = [];
      console.log(
        `   - 📦 Processing asset batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          assetBlueprints.length / BATCH_SIZE
        )}...`
      );

      for (const blueprint of batchBlueprints) {
        const type = blueprint.type!;
        const currentSequence = sequenceMap.get(type) || 1;
        const assetNumber = `${assetTypePrefixes[type]}-${String(
          currentSequence
        ).padStart(5, "0")}`;
        sequenceMap.set(type, currentSequence + 1);

        const description = `${type.replace(/_/g, " ")} #${currentSequence}`;
        const serialNumber = `SN-${assetNumber}`; // Guaranteed unique serial number

        let asset: schema.NewAsset;
        if (blueprint.assignedToUser) {
          const user = blueprint.assignedToUser;
          asset = {
            assetNumber,
            type,
            state: "ISSUED",
            serialNumber,
            description,
            purchasePrice: (Math.random() * 1500 + 300).toFixed(2),
            assignmentType: "INDIVIDUAL",
            assignedTo: user.name,
            employeeId: user.employeeId,
            department: user.department,
            locationId:
              officeLocations[
                Math.floor(Math.random() * officeLocations.length)
              ].id,
          };
        } else {
          asset = {
            assetNumber,
            type,
            state: "AVAILABLE",
            serialNumber,
            description,
            purchasePrice: (Math.random() * 1500 + 300).toFixed(2),
            assignmentType: "INDIVIDUAL",
            locationId: itStoreRoom.id,
          };
        }
        assetsToInsert.push(asset);
      }

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

    // --- Stage 6: Update Sequences ---
    console.log("\n--- Stage 6: Updating Final Sequence Numbers ---");
    for (const [assetType, nextSequence] of sequenceMap.entries()) {
      await db
        .update(assetSequencesTable)
        .set({ nextSequence })
        .where(eq(assetSequencesTable.assetType, assetType));
    }

    console.log("\n✅ Database seeded successfully with large dataset!");
  } catch (error) {
    console.error("❌ A critical error occurred during seeding:", error);
    throw error;
  } finally {
    console.log("   - Closing database connection...");
    await client.end();
  }
}

// --- Main execution ---
seedDatabase().catch((err) => {
  console.error("Seeding script failed and exited.", err);
  process.exit(1);
});
