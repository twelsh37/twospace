// backend/lib/db/seed.ts
// Seed script for initial data using Drizzle ORM

import { db } from "./index";
import {
  usersTable,
  locationsTable,
  assetSequencesTable,
  type NewUser,
  type NewLocation,
} from "./schema";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Insert initial asset sequences
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

    // Insert initial locations
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

    // Insert default admin user
    const adminUser: NewUser = {
      name: "System Administrator",
      email: "admin@company.com",
      employeeId: "ADMIN001",
      department: "IT Department",
      role: "ADMIN",
    };

    await db.insert(usersTable).values(adminUser).onConflictDoNothing();

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
