// frontend/app/api/assets/building-by-type/route.ts
// API route to get the count of assets in the 'BUILDING' state, grouped by type

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Query assets in the 'BUILDING' state
  // Group by type and count the number of assets for each type
  const results = await db
    .select({ type: assetsTable.type })
    .from(assetsTable)
    .where(eq(assetsTable.state, "BUILDING"));

  // Aggregate counts by type
  const typeCounts: Record<string, number> = {};
  for (const row of results) {
    typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
  }

  // Convert to array format for frontend
  const response = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  // Return as JSON
  return NextResponse.json(response);
}
