#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Asset Transition Script
 * Transitions assets through various stages with proper asset history tracking
 *
 * Usage:
 *   tsx scripts/transition-assets.ts -b asset1,asset2,asset3  # Transition to BUILDING
 *   tsx scripts/transition-assets.ts -r asset1,asset2,asset3  # Transition to READY_TO_GO
 *   tsx scripts/transition-assets.ts -s asset1,asset2,asset3  # Transition to SIGNED_OUT
 *   tsx scripts/transition-assets.ts -b asset1 -r asset2      # Multiple operations
 *
 * Stages: AVAILABLE → SIGNED_OUT → BUILDING → READY_TO_GO → ISSUED
 */

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, inArray } from "drizzle-orm";
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

// Asset type-specific state transition maps
const STATE_TRANSITIONS = {
  // Standard assets (phones, tablets, desktops, laptops): AVAILABLE → SIGNED_OUT → BUILDING → READY_TO_GO → ISSUED
  standard: {
    AVAILABLE: ["SIGNED_OUT"],
    SIGNED_OUT: ["BUILDING"],
    BUILDING: ["READY_TO_GO"],
    READY_TO_GO: ["ISSUED"],
    ISSUED: ["AVAILABLE"], // Can be returned to available
  },
  // Monitors: AVAILABLE → SIGNED_OUT → READY_TO_GO → ISSUED (skip BUILDING)
  monitor: {
    AVAILABLE: ["SIGNED_OUT"],
    SIGNED_OUT: ["READY_TO_GO"],
    READY_TO_GO: ["ISSUED"],
    ISSUED: ["AVAILABLE"], // Can be returned to available
  },
};

// Transition reasons and details
const TRANSITION_DETAILS = {
  SIGNED_OUT: {
    reason: "Asset signed out for building/preparation",
    details: { transitionType: "SIGNED_OUT", performedBy: "script" },
  },
  BUILDING: {
    reason: "Asset moved to building stage",
    details: { transitionType: "BUILDING", performedBy: "script" },
  },
  READY_TO_GO: {
    reason: "Asset prepared and ready for assignment",
    details: { transitionType: "READY_TO_GO", performedBy: "script" },
  },
};

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

  // If no admin found, create a system user or use first available user
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
 * Get transition map based on asset type
 */
function getTransitionMap(assetType: string) {
  return assetType === "MONITOR"
    ? STATE_TRANSITIONS.monitor
    : STATE_TRANSITIONS.standard;
}

/**
 * Validate asset state transition
 */
function isValidTransition(
  fromState: string,
  toState: string,
  assetType: string
): boolean {
  const transitionMap = getTransitionMap(assetType);
  const allowedTransitions =
    transitionMap[fromState as keyof typeof transitionMap] || [];
  return allowedTransitions.includes(toState);
}

/**
 * Get transition path from current state to target state
 */
function getTransitionPath(
  currentState: string,
  targetState: string,
  assetType: string
): string[] {
  const path: string[] = [];
  let current = currentState;
  const transitionMap = getTransitionMap(assetType);

  while (current !== targetState && path.length < 10) {
    // Prevent infinite loops
    const nextStates = transitionMap[current as keyof typeof transitionMap];
    if (!nextStates || nextStates.length === 0) {
      throw new Error(
        `Cannot transition from ${current} to ${targetState} for asset type ${assetType}`
      );
    }

    // Find the next state that gets us closer to target
    let nextState = nextStates[0]; // Default to first option

    // If we can go directly to target, do it
    if (nextStates.includes(targetState)) {
      nextState = targetState;
    }

    path.push(nextState);
    current = nextState;
  }

  return path;
}

/**
 * Transition a single asset through states
 */
async function transitionAsset(
  asset: any,
  targetState: string,
  adminUserId: string
) {
  console.log(
    `\n🔄 Transitioning asset ${asset.assetNumber} from ${asset.state} to ${targetState}`
  );

  try {
    // Get the transition path based on asset type
    const transitionPath = getTransitionPath(
      asset.state,
      targetState,
      asset.type
    );
    console.log(
      `   Path: ${asset.state} -> ${transitionPath.join(" -> ")} (${
        asset.type
      })`
    );

    // Execute each transition in the path
    let currentState = asset.state;

    for (const nextState of transitionPath) {
      console.log(`   📝 Transitioning: ${currentState} -> ${nextState}`);

      // Create asset history entry
      const historyEntry = {
        assetId: asset.id,
        previousState: currentState as
          | "AVAILABLE"
          | "SIGNED_OUT"
          | "BUILDING"
          | "READY_TO_GO"
          | "ISSUED"
          | "holding",
        newState: nextState as
          | "AVAILABLE"
          | "SIGNED_OUT"
          | "BUILDING"
          | "READY_TO_GO"
          | "ISSUED"
          | "holding",
        changedBy: adminUserId,
        changeReason:
          TRANSITION_DETAILS[nextState as keyof typeof TRANSITION_DETAILS]
            ?.reason || `State transition from ${currentState} to ${nextState}`,
        timestamp: new Date(),
        details: JSON.stringify({
          ...TRANSITION_DETAILS[nextState as keyof typeof TRANSITION_DETAILS]
            ?.details,
          previousState: currentState,
          newState: nextState,
          transitionMethod: "script",
          assetType: asset.type,
        }),
      };

      await db.insert(assetHistoryTable).values(historyEntry);
      console.log(`   ✅ History recorded for ${currentState} -> ${nextState}`);

      currentState = nextState;
    }

    // Update asset state
    await db
      .update(assetsTable)
      .set({
        state: targetState as
          | "AVAILABLE"
          | "SIGNED_OUT"
          | "BUILDING"
          | "READY_TO_GO"
          | "ISSUED"
          | "holding",
        updatedAt: new Date(),
      })
      .where(eq(assetsTable.id, asset.id));

    console.log(
      `   ✅ Asset ${asset.assetNumber} successfully transitioned to ${targetState}`
    );
    return true;
  } catch (error) {
    console.error(
      `   ❌ Failed to transition asset ${asset.assetNumber}:`,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Main transition function
 */
async function transitionAssets(assetNumbers: string[], targetState: string) {
  console.log(`\n🚀 Starting asset transitions to ${targetState}`);
  console.log(`📋 Assets: ${assetNumbers.join(", ")}`);

  try {
    // Get admin user ID
    const adminUserId = await getAdminUserId();

    // Fetch assets
    console.log("\n🔍 Fetching assets from database...");
    const assets = await db
      .select()
      .from(assetsTable)
      .where(inArray(assetsTable.assetNumber, assetNumbers));

    if (assets.length === 0) {
      console.error("❌ No assets found with the provided asset numbers");
      return;
    }

    console.log(`✅ Found ${assets.length} assets`);

    // Validate target state
    if (!["SIGNED_OUT", "BUILDING", "READY_TO_GO"].includes(targetState)) {
      console.error(
        `❌ Invalid target state: ${targetState}. Must be SIGNED_OUT, BUILDING, or READY_TO_GO`
      );
      return;
    }

    // Process each asset
    let successCount = 0;
    let failureCount = 0;

    for (const asset of assets) {
      console.log(
        `\n📦 Processing asset: ${asset.assetNumber} (current state: ${asset.state})`
      );

      // Check if transition is needed
      if (asset.state === targetState) {
        console.log(`   ⏭️  Asset already in ${targetState} state, skipping`);
        continue;
      }

      // Check if transition is valid
      if (!isValidTransition(asset.state, targetState, asset.type)) {
        console.log(
          `   ⚠️  Cannot transition from ${asset.state} to ${targetState} for ${asset.type}, attempting path transition`
        );
      }

      const success = await transitionAsset(asset, targetState, adminUserId);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // Summary
    console.log(`\n📊 Transition Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📦 Total processed: ${assets.length}`);
  } catch (error) {
    console.error(
      "❌ Script failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    signedOut: [] as string[],
    building: [] as string[],
    ready: [] as string[],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-s" || arg === "--signed-out") {
      const assets = args[i + 1]
        ?.split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      if (assets && assets.length > 0) {
        options.signedOut.push(...assets);
        i++; // Skip next argument
      }
    } else if (arg === "-b" || arg === "--building") {
      const assets = args[i + 1]
        ?.split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      if (assets && assets.length > 0) {
        options.building.push(...assets);
        i++; // Skip next argument
      }
    } else if (arg === "-r" || arg === "--ready") {
      const assets = args[i + 1]
        ?.split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      if (assets && assets.length > 0) {
        options.ready.push(...assets);
        i++; // Skip next argument
      }
    } else if (arg === "-h" || arg === "--help") {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Asset Transition Script
======================

Transitions assets through various stages with proper asset history tracking.

Usage:
  tsx scripts/transition-assets.ts -s asset1,asset2,asset3
  tsx scripts/transition-assets.ts -b asset1,asset2,asset3
  tsx scripts/transition-assets.ts -r asset1,asset2,asset3
  tsx scripts/transition-assets.ts -s asset1 -b asset2 -r asset3

Options:
  -s, --signed-out <assets> Transition assets to SIGNED_OUT state
  -b, --building <assets>   Transition assets to BUILDING state
  -r, --ready <assets>       Transition assets to READY_TO_GO state
  -h, --help                Show this help message

Examples:
  tsx scripts/transition-assets.ts -s 01-12345,01-12346
  tsx scripts/transition-assets.ts -b 01-12345,01-12346
  tsx scripts/transition-assets.ts -r 01-12345,01-12346
  tsx scripts/transition-assets.ts -s 01-12345 -b 01-12346 -r 01-12347

Asset States:
  Standard Assets (Phones, Tablets, Desktops, Laptops):
    AVAILABLE → SIGNED_OUT → BUILDING → READY_TO_GO → ISSUED

  Monitors:
    AVAILABLE → SIGNED_OUT → READY_TO_GO → ISSUED

Notes:
  - Assets will be transitioned through intermediate states if necessary
  - Monitors skip the BUILDING stage as they are already complete devices
  - Full asset history is recorded for each transition
  - Requires admin user in database
  - Requires proper environment variables (DATABASE_URL, etc.)
`);
}

/**
 * Main execution
 */
async function main() {
  console.log("🏭 Asset Transition Script");
  console.log("========================\n");

  const options = parseArguments();

  // Check if any options were provided
  if (
    options.signedOut.length === 0 &&
    options.building.length === 0 &&
    options.ready.length === 0
  ) {
    console.error("❌ No assets specified. Use -s, -b, or -r options.");
    console.error("   Run with -h for help.");
    process.exit(1);
  }

  // Process signed-out transitions
  if (options.signedOut.length > 0) {
    await transitionAssets(options.signedOut, "SIGNED_OUT");
  }

  // Process building transitions
  if (options.building.length > 0) {
    await transitionAssets(options.building, "BUILDING");
  }

  // Process ready transitions
  if (options.ready.length > 0) {
    await transitionAssets(options.ready, "READY_TO_GO");
  }

  console.log("\n🎉 Script completed successfully!");
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

export { transitionAssets, getTransitionPath, isValidTransition };
