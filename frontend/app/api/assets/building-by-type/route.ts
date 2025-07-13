// frontend/app/api/assets/building-by-type/route.ts
// API route to get the count of assets in the 'BUILDING' state, grouped by type

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET() {
  // Log the start of the GET request
  appLogger.info("GET /api/assets/building-by-type called");
  try {
    // Query assets in the 'BUILDING' state
    // Group by type and count the number of assets for each type
    const results = await db
      .select({ type: assetsTable.type })
      .from(assetsTable)
      .where(eq(assetsTable.state, "BUILDING"));

    const ALL_TYPES = [
      "DESKTOP",
      "LAPTOP",
      "MONITOR",
      "MOBILE_PHONE",
      "TABLET",
    ];

    // Aggregate counts by type (normalize to uppercase)
    const typeCounts: Record<string, number> = {};
    for (const row of results) {
      const type = (row.type || "").toUpperCase();
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    // Ensure all types are present, in the correct order
    const response = ALL_TYPES.map((type) => ({
      type,
      count: typeCounts[type] || 0,
    }));

    appLogger.info("Aggregated building-by-type asset counts", { response });
    // Return as JSON
    return NextResponse.json(response);
  } catch (error) {
    systemLogger.error(
      `Error in GET /api/assets/building-by-type: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch building-by-type asset counts" },
      { status: 500 }
    );
  }
}
