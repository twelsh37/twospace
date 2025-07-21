// frontend/scripts/seed-settings.ts
// Script to seed the settings table with a default row if not present

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
