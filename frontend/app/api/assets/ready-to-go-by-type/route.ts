// frontend/app/api/assets/ready-to-go-by-type/route.ts
// API route to get the count of assets in the 'READY_TO_GO' state, grouped by type

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireAuth } from "@/lib/supabase-auth-helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Require authentication for accessing ready-to-go-by-type data
  const user = await requireAuth(request);
  if (user instanceof Response) return user; // Not authenticated
  // Log the start of the GET request
  appLogger.info("GET /api/assets/ready-to-go-by-type called");
  try {
    // Query assets in the 'READY_TO_GO' state
    // Group by type and count the number of assets for each type
    const results = await db
      .select({ type: assetsTable.type })
      .from(assetsTable)
      .where(eq(assetsTable.state, "READY_TO_GO"));

    const ALL_TYPES = [
      "DESKTOP",
      "LAPTOP",
      "MONITOR",
      "MOBILE_PHONE",
      "TABLET",
    ];

    // Aggregate counts by type
    const typeCounts: Record<string, number> = {};
    for (const row of results) {
      typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
    }

    // Ensure all types are present, even if zero
    const response = ALL_TYPES.map((type) => ({
      type,
      count: typeCounts[type] || 0,
    }));

    appLogger.info("Aggregated ready-to-go-by-type asset counts", { response });
    // Return as JSON
    return NextResponse.json(response);
  } catch (error) {
    systemLogger.error(
      `Error in GET /api/assets/ready-to-go-by-type: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch ready-to-go-by-type asset counts" },
      { status: 500 }
    );
  }
}
