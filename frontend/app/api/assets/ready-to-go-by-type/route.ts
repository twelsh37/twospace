// frontend/app/api/assets/ready-to-go-by-type/route.ts
// API route to get the count of assets in the 'READY_TO_GO' state, grouped by type

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Query assets in the 'READY_TO_GO' state
  // Group by type and count the number of assets for each type
  const results = await db
    .select({ type: assetsTable.type })
    .from(assetsTable)
    .where(eq(assetsTable.state, "READY_TO_GO"));

  const ALL_TYPES = ["DESKTOP", "LAPTOP", "MONITOR", "MOBILE_PHONE", "TABLET"];

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

  // Return as JSON
  return NextResponse.json(response);
}
