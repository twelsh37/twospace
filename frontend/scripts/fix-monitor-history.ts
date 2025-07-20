#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Fix Monitor Asset History Script
 * Removes incorrect BUILDING stage transitions from monitor assets
 *
 * Monitors should follow: AVAILABLE → SIGNED_OUT → READY_TO_GO → ISSUED
 * Not: AVAILABLE → SIGNED_OUT → BUILDING → READY_TO_GO → ISSUED
 */

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, inArray, and, desc } from "drizzle-orm";
import { assetsTable, assetHistoryTable, usersTable } from "../lib/db/schema";

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL =
  process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !DATABASE_URL) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.error("   - DATABASE_URL or POSTGRES_URL_NON_POOLING");
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

/**
 * Get admin user ID from database
 */
async function getAdminUserId() {
  console.log("🔍 Looking up admin user...");

  // Try to find admin user by email
  const adminEmails = ["tom.welsh@theaiaa.com", "tom.welsh@gtrailway.com"];

  for (const email of adminEmails) {
    const user = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user.length > 0) {
      console.log(`✅ Found admin user: ${user[0].name} (${email})`);
      return user[0].id;
    }
  }

  // If no admin found, use first available user
  const anyUser = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .limit(1);

  if (anyUser.length > 0) {
    console.log(`⚠️  Using user: ${anyUser[0].name} (no admin found)`);
    return anyUser[0].id;
  }

  throw new Error("No users found in database");
}

/**
 * Find monitors in READY_TO_GO state
 */
async function findMonitorsInReadyToGo() {
  console.log("🔍 Finding monitors in READY_TO_GO state...");

  const monitors = await db
    .select()
    .from(assetsTable)
    .where(
      and(eq(assetsTable.type, "MONITOR"), eq(assetsTable.state, "READY_TO_GO"))
    );

  console.log(`✅ Found ${monitors.length} monitors in READY_TO_GO state`);
  return monitors;
}

/**
 * Check if monitor has missing READY_TO_GO transition
 */
async function checkMissingReadyToGoTransition(assetId: string) {
  const history = await db
    .select()
    .from(assetHistoryTable)
    .where(eq(assetHistoryTable.assetId, assetId))
    .orderBy(assetHistoryTable.timestamp);

  // Check if there's a transition to READY_TO_GO
  const readyToGoTransitions = history.filter(
    (h) => h.newState === "READY_TO_GO"
  );

  // Check if the last transition is to READY_TO_GO
  const lastTransition = history[history.length - 1];
  const hasReadyToGoTransition = readyToGoTransitions.length > 0;
  const lastTransitionIsReadyToGo =
    lastTransition && lastTransition.newState === "READY_TO_GO";

  return {
    hasReadyToGoTransition,
    lastTransitionIsReadyToGo,
    lastTransition,
    fullHistory: history,
  };
}

/**
 * Check if monitor has incorrect BUILDING history
 */
async function checkMonitorHistory(assetId: string) {
  const history = await db
    .select()
    .from(assetHistoryTable)
    .where(eq(assetHistoryTable.assetId, assetId))
    .orderBy(desc(assetHistoryTable.timestamp));

  // Check if there's a BUILDING transition
  const buildingTransitions = history.filter(
    (h) => h.newState === "BUILDING" || h.previousState === "BUILDING"
  );

  return {
    hasBuildingHistory: buildingTransitions.length > 0,
    buildingTransitions,
    fullHistory: history,
  };
}

/**
 * Fix monitor history by removing BUILDING transitions and adding missing READY_TO_GO transitions
 */
async function fixMonitorHistory(assetId: string, adminUserId: string) {
  console.log(`   🔧 Fixing history for asset ${assetId}...`);

  try {
    let totalFixed = 0;
    let totalRemoved = 0;

    // Get current history
    const history = await db
      .select()
      .from(assetHistoryTable)
      .where(eq(assetHistoryTable.assetId, assetId))
      .orderBy(desc(assetHistoryTable.timestamp));

    // Find BUILDING transitions to remove
    const buildingTransitions = history.filter(
      (h) => h.newState === "BUILDING" || h.previousState === "BUILDING"
    );

    if (buildingTransitions.length > 0) {
      console.log(
        `   📝 Found ${buildingTransitions.length} BUILDING transitions to remove`
      );

      // Remove BUILDING transitions
      for (const transition of buildingTransitions) {
        await db
          .delete(assetHistoryTable)
          .where(eq(assetHistoryTable.id, transition.id));
        console.log(
          `   🗑️  Removed transition: ${transition.previousState} → ${transition.newState}`
        );
        totalRemoved++;
      }
      totalFixed++;
    }

    // Check for missing READY_TO_GO transition
    const readyToGoCheck = await checkMissingReadyToGoTransition(assetId);

    if (!readyToGoCheck.hasReadyToGoTransition) {
      console.log(`   ⚠️  Missing READY_TO_GO transition, adding...`);

      // Find the last SIGNED_OUT transition
      const signedOutTransitions = history.filter(
        (h) => h.newState === "SIGNED_OUT"
      );
      const lastSignedOut =
        signedOutTransitions[signedOutTransitions.length - 1];

      if (lastSignedOut) {
        // Create missing SIGNED_OUT → READY_TO_GO transition
        const missingTransition = {
          assetId: assetId,
          previousState: "SIGNED_OUT" as "SIGNED_OUT",
          newState: "READY_TO_GO" as "READY_TO_GO",
          changedBy: adminUserId,
          changeReason: "Direct transition to READY_TO_GO (monitor lifecycle)",
          timestamp: new Date(),
          details: JSON.stringify({
            transitionType: "DIRECT",
            performedBy: "script",
            previousState: "SIGNED_OUT",
            newState: "READY_TO_GO",
            transitionMethod: "script",
            assetType: "MONITOR",
            fixReason: "Added missing READY_TO_GO transition for monitor",
          }),
        };

        await db.insert(assetHistoryTable).values(missingTransition);
        console.log(
          `   ✅ Created missing transition: SIGNED_OUT → READY_TO_GO`
        );
        totalFixed++;
      }
    }

    // Fix any remaining gaps in the history by creating direct transitions
    const remainingHistory = await db
      .select()
      .from(assetHistoryTable)
      .where(eq(assetHistoryTable.assetId, assetId))
      .orderBy(assetHistoryTable.timestamp);

    // Look for gaps where BUILDING was removed
    for (let i = 0; i < remainingHistory.length - 1; i++) {
      const current = remainingHistory[i];
      const next = remainingHistory[i + 1];

      // If there's a gap (e.g., SIGNED_OUT -> READY_TO_GO), create a direct transition
      if (
        current.newState === "SIGNED_OUT" &&
        next.previousState === "READY_TO_GO"
      ) {
        console.log(
          `   🔗 Creating direct transition: SIGNED_OUT → READY_TO_GO`
        );

        const directTransition = {
          assetId: assetId,
          previousState: "SIGNED_OUT" as "SIGNED_OUT",
          newState: "READY_TO_GO" as "READY_TO_GO",
          changedBy: adminUserId,
          changeReason:
            "Direct transition (BUILDING stage removed for monitor)",
          timestamp: new Date(),
          details: JSON.stringify({
            transitionType: "DIRECT",
            performedBy: "script",
            previousState: "SIGNED_OUT",
            newState: "READY_TO_GO",
            transitionMethod: "script",
            assetType: "MONITOR",
            fixReason: "Removed incorrect BUILDING stage for monitor",
          }),
        };

        await db.insert(assetHistoryTable).values(directTransition);
        console.log(`   ✅ Created direct transition history entry`);
        totalFixed++;
      }
    }

    if (totalFixed === 0 && totalRemoved === 0) {
      console.log(`   ✅ No fixes needed`);
      return { fixed: false, removed: 0 };
    }

    return { fixed: true, removed: totalRemoved, added: totalFixed };
  } catch (error) {
    console.error(
      `   ❌ Error fixing history for asset ${assetId}:`,
      error instanceof Error ? error.message : String(error)
    );
    return { fixed: false, removed: 0, error: error };
  }
}

/**
 * Main function to fix monitor history
 */
async function fixAllMonitorHistory() {
  console.log("🏭 Fix Monitor Asset History Script");
  console.log("==================================\n");

  try {
    // Get admin user ID
    const adminUserId = await getAdminUserId();

    // Find monitors in READY_TO_GO state
    const monitors = await findMonitorsInReadyToGo();

    if (monitors.length === 0) {
      console.log("✅ No monitors in READY_TO_GO state found");
      return;
    }

    let totalFixed = 0;
    let totalRemoved = 0;
    let totalAdded = 0;
    let totalErrors = 0;

    // Process each monitor
    for (const monitor of monitors) {
      console.log(
        `\n📦 Processing monitor: ${monitor.assetNumber} (${monitor.type})`
      );

      // Check current history
      const historyCheck = await checkMonitorHistory(monitor.id);
      const readyToGoCheck = await checkMissingReadyToGoTransition(monitor.id);

      const needsFixing =
        historyCheck.hasBuildingHistory ||
        !readyToGoCheck.hasReadyToGoTransition;

      if (!needsFixing) {
        console.log(`   ✅ No fixes needed`);
        continue;
      }

      if (historyCheck.hasBuildingHistory) {
        console.log(`   ⚠️  Found BUILDING history, fixing...`);
      }

      if (!readyToGoCheck.hasReadyToGoTransition) {
        console.log(`   ⚠️  Missing READY_TO_GO transition, fixing...`);
      }

      // Fix the history
      const result = await fixMonitorHistory(monitor.id, adminUserId);

      if (result.fixed) {
        totalFixed++;
        totalRemoved += result.removed || 0;
        totalAdded += result.added || 0;
        console.log(`   ✅ Fixed history for ${monitor.assetNumber}`);
      } else {
        totalErrors++;
        console.log(`   ❌ Failed to fix history for ${monitor.assetNumber}`);
      }
    }

    // Summary
    console.log(`\n📊 Fix Summary:`);
    console.log(`   📦 Monitors processed: ${monitors.length}`);
    console.log(`   ✅ Successfully fixed: ${totalFixed}`);
    console.log(`   🗑️  BUILDING transitions removed: ${totalRemoved}`);
    console.log(`   ➕ READY_TO_GO transitions added: ${totalAdded}`);
    console.log(`   ❌ Errors: ${totalErrors}`);

    if (totalFixed > 0) {
      console.log(`\n🎉 Successfully fixed ${totalFixed} monitor histories!`);
    } else {
      console.log(`\n✅ No monitor histories needed fixing`);
    }
  } catch (error) {
    console.error(
      "❌ Script failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixAllMonitorHistory().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

export { fixAllMonitorHistory, checkMonitorHistory, fixMonitorHistory };
