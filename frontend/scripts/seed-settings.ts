// frontend/scripts/seed-settings.ts
// Script to seed the settings table with a default row if not present

import { db } from "../lib/db";
import { settingsTable } from "../lib/db/schema";

async function seedSettings() {
  // Check if a settings row already exists
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length > 0) {
    console.log("Settings row already exists. No action taken.");
    return;
  }
  // Insert default settings row
  await db.insert(settingsTable).values({ reportCacheDuration: 30 }).execute();
  console.log("Default settings row inserted.");
}

seedSettings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding settings:", err);
    process.exit(1);
  });
