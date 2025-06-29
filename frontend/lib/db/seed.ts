// backend/lib/db/seed.ts
// Standalone seed script for generating a large, realistic dataset.
// FILEPATH: frontend/lib/db/seed.ts
//
// REASONING: Updated to support new schema with departments table and user location/department foreign keys. Locations and departments are now seeded from config. Users are assigned to both location and department by ID. Old department string field removed from user inserts. Admin user is assigned to a valid location and department.

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, ne } from "drizzle-orm";
import * as schema from "./schema";

const {
  usersTable,
  locationsTable,
  departmentsTable,
  assetSequencesTable,
  assetsTable,
  assetHistoryTable,
  assetTypeEnum,
} = schema;

type AssetBlueprint = {
  type: (typeof assetTypeEnum.enumValues)[number];
  assignedToUser?: schema.User;
  model?: string;
  price?: number;
  state?: string;
};

// --- Configuration ---
const TOTAL_USERS = 12000;
const BATCH_SIZE = 500; // Increased batch size for performance with large datasets

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

// --- New Locations and Departments Config ---
const LOCATIONS_CONFIG = [
  { name: "London Office", description: "UK Branch" },
  { name: "New York Office", description: "US Branch" },
  { name: "Singapore Office", description: "Asia Branch" },
  { name: "Sydney Office", description: "Australia Branch" },
  { name: "Berlin Office", description: "Europe Branch" },
  { name: "IT Department - store room", description: "IT Store room" },
];

const DEPARTMENTS_CONFIG: { [location: string]: string[] } = {
  "London Office": [
    "Marketing",
    "Human Resources",
    "Finance",
    "Legal",
    "Research",
    "Operations",
    "IT Department",
    "Engineering",
  ],
  "New York Office": ["Sales", "Operations", "Finance", "IT Department"],
  "Singapore Office": ["Sales", "Operations", "Finance", "IT Department"],
  "Sydney Office": ["Sales", "Operations", "Finance", "IT Department"],
  "Berlin Office": ["Sales", "Operations", "Finance", "IT Department"],
  "IT Department - store room": ["IT Department"], // Only IT Department for store room
};

// --- Helper Functions ---
const shuffleArray = <T>(array: T[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// --- Asset Models and Department Hardware Requirements ---
// Asset models and prices for realism
const ASSET_MODELS = {
  MOBILE_PHONE: { model: "Apple iPhone 16", price: 699.0 },
  TABLET: { model: "Apple iPad 11", price: 328.0 },
  DESKTOP: [
    { model: "Dell Optiplex Micro", price: 566.28 },
    { model: "OptiPlex XE4 Small Form Factor", price: 1787.64 },
  ],
  LAPTOP: [
    { model: "Dell XPS 14", price: 1199.0 },
    { model: "Dell Inspiron 14 Plus", price: 599.0 },
    { model: "Apple Mac Pro", price: 1999.0 },
  ],
  MONITOR: { model: "Dell 27 Plus 4k", price: 269.1 },
};

// Department hardware requirements
const DEPT_HARDWARE = {
  Marketing: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "LAPTOP", model: "Apple Mac Pro" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  "Human Resources": [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "DESKTOP", model: "Dell Optiplex Micro" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  Finance: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "DESKTOP", model: "Dell Optiplex Micro" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  Legal: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "LAPTOP", model: "Dell Inspiron 14 Plus" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  Research: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "LAPTOP", model: "Dell XPS 14" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  Operations: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "DESKTOP", model: "OptiPlex XE4 Small Form Factor" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  "IT Department": [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "DESKTOP", model: "OptiPlex XE4 Small Form Factor" },
    { type: "DESKTOP", model: "OptiPlex XE4 Small Form Factor" },
    { type: "DESKTOP", model: "OptiPlex XE4 Small Form Factor" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  Engineering: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "DESKTOP", model: "Dell Optiplex Micro" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
  Sales: [
    { type: "TABLET", model: "Apple iPad 11" },
    { type: "LAPTOP", model: "Dell XPS 14" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
    { type: "MONITOR", model: "Dell 27 Plus 4k" },
  ],
};

// --- Utility: Map state variants to canonical values for normalization ---
const canonicalizeState = (state: string | undefined): string => {
  if (!state) return "AVAILABLE"; // Default for unassigned assets
  const map: Record<string, string> = {
    // Holding/Imported
    holding: "holding",
    imported: "holding",
    HOLDING: "holding",
    IMPORTED: "holding",
    // Available
    available: "AVAILABLE",
    AVAILABLE: "AVAILABLE",
    stock: "AVAILABLE",
    STOCK: "AVAILABLE",
    // Built/Building
    built: "BUILT",
    BUILT: "BUILT",
    building: "BUILT",
    BUILDING: "BUILT",
    // Ready To Go
    ready_to_go: "READY_TO_GO",
    READY_TO_GO: "READY_TO_GO",
    readytogo: "READY_TO_GO",
    "ready-to-go": "READY_TO_GO",
    // Issued/Active
    issued: "ISSUED",
    ISSUED: "ISSUED",
    active: "ISSUED",
    ACTIVE: "ISSUED",
  };
  return map[state] || state;
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
    // Insert locations
    await db
      .insert(locationsTable)
      .values(LOCATIONS_CONFIG)
      .onConflictDoNothing();
    // Fetch all locations with IDs for department seeding
    const locations = await db.select().from(locationsTable);
    // Insert departments for each location
    const departmentsToSeed: schema.NewDepartment[] = [];
    for (const loc of locations) {
      const deptNames = DEPARTMENTS_CONFIG[loc.name] || [];
      for (const deptName of deptNames) {
        departmentsToSeed.push({ name: deptName, locationId: loc.id });
      }
    }
    await db
      .insert(departmentsTable)
      .values(departmentsToSeed)
      .onConflictDoNothing();
    // Fetch all departments with IDs for user seeding
    const departments = await db.select().from(departmentsTable);
    // Insert admin user (assign to London Office, IT Department)
    const londonOffice = locations.find((l) => l.name === "London Office");
    const londonITDept = departments.find(
      (d) => d.name === "IT Department" && d.locationId === londonOffice?.id
    );
    await db
      .insert(usersTable)
      .values({
        name: "System Administrator",
        email: "admin@theaiaa.co.uk",
        employeeId: "ADMIN001",
        locationId: londonOffice?.id,
        departmentId: londonITDept?.id,
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as schema.NewUser)
      .onConflictDoNothing();
    console.log("   ✓ Locations, departments, and admin user seeded.");

    // --- Stage 3: Generate and Insert Users ---
    console.log(`\n--- Stage 3: Generating ${TOTAL_USERS} Users ---`);
    const usersToInsert: schema.NewUser[] = [];
    const emailCounts: { [key: string]: number } = {}; // To track duplicate names
    // Build a flat list of department-location pairs for user assignment
    const deptLocPairs = departments.map((d) => ({
      departmentId: d.id,
      locationId: d.locationId,
      departmentName: d.name,
      locationName: locations.find((l) => l.id === d.locationId)?.name || "",
    }));

    // 1. Add a specific Linda Taylor user for testing
    // Pick the first department/location pair for Linda (or customize as needed)
    const lindaPair = deptLocPairs[0];
    const lindaEmail = "linda.taylor@theaiaa.com";
    usersToInsert.push({
      name: "Linda Taylor",
      email: lindaEmail,
      employeeId: `EMP${String(99999).padStart(5, "0")}`,
      locationId: lindaPair.locationId,
      departmentId: lindaPair.departmentId,
      role: "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    emailCounts["linda.taylor"] = 1;

    // 2. Generate the rest of the users (excluding Linda Taylor)
    for (let i = 0; i < TOTAL_USERS - 1; i++) {
      const gender = Math.random() > 0.5 ? "male" : "female";
      const firstName =
        gender === "male"
          ? MALE_FIRST_NAMES[i % MALE_FIRST_NAMES.length]
          : FEMALE_FIRST_NAMES[i % FEMALE_FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i + 5) % LAST_NAMES.length];
      // Unique email logic
      const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      // Avoid duplicating Linda Taylor
      if (baseUsername === "linda.taylor") {
        emailCounts[baseUsername] = (emailCounts[baseUsername] || 1) + 1;
        continue;
      }
      const count = emailCounts[baseUsername] || 0;
      const finalUsername =
        count === 0 ? baseUsername : `${baseUsername}${count}`;
      const email = `${finalUsername}@theaiaa.com`;
      emailCounts[baseUsername] = count + 1;
      // Assign user to a department-location pair in round-robin fashion
      const pair = deptLocPairs[(i + 1) % deptLocPairs.length]; // +1 to avoid Linda's pair
      usersToInsert.push({
        name: `${firstName} ${lastName}`,
        email: email,
        employeeId: `EMP${String(10000 + i).padStart(5, "0")}`,
        locationId: pair.locationId,
        departmentId: pair.departmentId,
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    for (let i = 0; i < usersToInsert.length; i += BATCH_SIZE) {
      const batch = usersToInsert.slice(i, i + BATCH_SIZE);
      console.log(
        `   - 👤 Inserting user batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          usersToInsert.length / BATCH_SIZE
        )}...`
      );
      await db.insert(usersTable).values(batch as schema.NewUser[]);
    }
    console.log("   ✓ All users seeded successfully.");

    // --- Stage 4: Generate Asset Blueprints ---
    console.log("\n--- Stage 4: Generating Asset Blueprints ---");
    const allUsers = await db.query.usersTable.findMany({
      where: eq(usersTable.role, "USER"),
    });
    // Debug: Print all users named Linda Taylor
    const lindaUsers = allUsers.filter((u) => u.name === "Linda Taylor");
    console.log("[DEBUG] Users named Linda Taylor:");
    lindaUsers.forEach((u) => {
      console.log(
        `  Name: ${u.name}, Email: ${u.email}, DepartmentId: ${u.departmentId}, LocationId: ${u.locationId}, EmployeeId: ${u.employeeId}`
      );
    });

    // --- Generate blueprints for ISSUED assets (assigned to users) ---
    const assetBlueprints: AssetBlueprint[] = [];
    const debugUserEmail = "linda.taylor@theaiaa.com";
    const debugUserAssets: AssetBlueprint[] = [];
    for (const user of allUsers) {
      // Everyone gets a mobile phone (ISSUED)
      const phoneBlueprint = {
        type: "MOBILE_PHONE" as (typeof assetTypeEnum.enumValues)[number],
        assignedToUser: user,
        model: ASSET_MODELS.MOBILE_PHONE.model,
        price: ASSET_MODELS.MOBILE_PHONE.price,
        state: "ISSUED", // Always ISSUED for user-assigned
      };
      assetBlueprints.push(phoneBlueprint);
      if (user.email === debugUserEmail) debugUserAssets.push(phoneBlueprint);
      // Department-specific assets (ISSUED)
      const dept = deptLocPairs.find(
        (d) => d.departmentId === user.departmentId
      );
      const deptName = dept?.departmentName;
      if (deptName && deptName in DEPT_HARDWARE) {
        const hardware =
          DEPT_HARDWARE[deptName as keyof typeof DEPT_HARDWARE] || [];
        for (const hw of hardware) {
          // Type guard for asset type
          if (
            !hw.type ||
            ![
              "MOBILE_PHONE",
              "TABLET",
              "DESKTOP",
              "LAPTOP",
              "MONITOR",
            ].includes(hw.type)
          )
            continue;
          let price = 0;
          if (hw.type === "DESKTOP" || hw.type === "LAPTOP") {
            const arr = ASSET_MODELS[hw.type as keyof typeof ASSET_MODELS];
            const found = Array.isArray(arr)
              ? arr.find(
                  (m: { model: string; price: number }) => m.model === hw.model
                )
              : undefined;
            price = found ? found.price : 0;
          } else {
            const modelData =
              ASSET_MODELS[hw.type as keyof typeof ASSET_MODELS];
            price =
              modelData && typeof modelData === "object" && "price" in modelData
                ? (modelData as { model: string; price: number }).price || 0
                : 0;
          }
          const blueprint = {
            type: hw.type as (typeof assetTypeEnum.enumValues)[number],
            assignedToUser: user,
            model: hw.model,
            price,
            state: "ISSUED", // Always ISSUED for user-assigned
          };
          assetBlueprints.push(blueprint);
          if (user.email === debugUserEmail) debugUserAssets.push(blueprint);
        }
      }
    }
    // Debug output for Linda Taylor
    if (debugUserAssets.length > 0) {
      console.log(`\n[DEBUG] Assets assigned to ${debugUserEmail}:`);
      debugUserAssets.forEach((a, idx) => {
        console.log(
          `  ${idx + 1}. Type: ${a.type}, Model: ${a.model}, Price: ${a.price}`
        );
      });
    } else {
      console.log(`\n[DEBUG] No assets assigned to ${debugUserEmail}`);
    }

    // --- Generate blueprints for STOCK assets (unassigned, in IT Department - store room) ---
    // Do NOT create any 'holding' state assets here. 'holding' assets are only created via the /imports functionality.
    // If there are no assets in 'holding', the dashboard card will display 'No Assets to Import'.
    // Only create AVAILABLE, BUILT, and READY_TO_GO stock assets.
    // Calculate stock percentages based on total user-assigned assets
    const issuedCount = assetBlueprints.length;
    const availableCount = Math.ceil(issuedCount * 0.01);
    const builtCount = Math.ceil(issuedCount * 0.001);
    const readyToGoCount = Math.ceil(issuedCount * 0.002);
    function createStockBlueprints(
      state: string,
      count: number
    ): AssetBlueprint[] {
      const stock: AssetBlueprint[] = [];
      for (const [typeKey, modelData] of Object.entries(ASSET_MODELS)) {
        const type = typeKey as keyof typeof ASSET_MODELS;
        if (
          !["MOBILE_PHONE", "TABLET", "DESKTOP", "LAPTOP", "MONITOR"].includes(
            type
          )
        )
          continue;
        if (Array.isArray(modelData)) {
          for (const m of modelData) {
            for (let i = 0; i < Math.ceil(count / 10); i++) {
              stock.push({
                type: type as (typeof assetTypeEnum.enumValues)[number],
                model: m.model,
                price: m.price,
                state,
              });
            }
          }
        } else if (modelData && typeof modelData === "object") {
          for (let i = 0; i < Math.ceil(count / 5); i++) {
            stock.push({
              type: type as (typeof assetTypeEnum.enumValues)[number],
              model: modelData.model,
              price: modelData.price,
              state,
            });
          }
        }
      }
      return stock;
    }
    assetBlueprints.push(...createStockBlueprints("AVAILABLE", availableCount));
    assetBlueprints.push(...createStockBlueprints("BUILT", builtCount));
    assetBlueprints.push(
      ...createStockBlueprints("READY_TO_GO", readyToGoCount)
    );

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

        // Use model or type as description (no sequence/hash)
        const description = blueprint.model || type.replace(/_/g, " ");
        const serialNumber = `SN-${assetNumber}`; // Guaranteed unique serial number
        let asset: schema.NewAsset;
        // --- Normalize state using canonicalizeState utility ---
        const normalizedState = canonicalizeState(blueprint.state);
        if (blueprint.assignedToUser) {
          const user = blueprint.assignedToUser;
          asset = {
            assetNumber,
            type,
            state: normalizedState as schema.Asset["state"],
            serialNumber,
            description,
            purchasePrice: blueprint.price?.toFixed(2) || "0.00",
            assignmentType: "INDIVIDUAL",
            assignedTo: user.email,
            employeeId: user.employeeId,
            locationId: user.locationId,
            status: "active",
          };
        } else {
          asset = {
            assetNumber,
            type,
            state: normalizedState as schema.Asset["state"],
            serialNumber,
            description,
            purchasePrice: blueprint.price?.toFixed(2) || "0.00",
            assignmentType: "INDIVIDUAL",
            locationId: itStoreRoom.id,
            status: normalizedState === "AVAILABLE" ? "stock" : "holding",
          };
        }
        assetsToInsert.push(asset);
      }

      const insertedAssets = await db
        .insert(assetsTable)
        .values(assetsToInsert)
        .returning({
          id: assetsTable.id,
          state: assetsTable.state,
        });
      const historyToInsert = insertedAssets.map((asset) => ({
        assetId: asset.id,
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
