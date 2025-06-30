// frontend/app/api/reports/asset-inventory/summary/route.ts
// API endpoint to return asset counts grouped by type and by state

import { NextResponse } from "next/server";
import { db, assetsTable } from "@/lib/db";
import { isNull, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Group by type
    const byTypeRows = await db
      .select({ type: assetsTable.type, count: sql<number>`count(*)` })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt))
      .groupBy(assetsTable.type);
    const byType: Record<string, number> = {};
    for (const row of byTypeRows) {
      byType[row.type as string] = Number(row.count);
    }
    // Group by state
    const byStateRows = await db
      .select({ state: assetsTable.state, count: sql<number>`count(*)` })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt))
      .groupBy(assetsTable.state);
    const byState: Record<string, number> = {};
    for (const row of byStateRows) {
      byState[row.state as string] = Number(row.count);
    }
    return NextResponse.json({ byType, byState });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
