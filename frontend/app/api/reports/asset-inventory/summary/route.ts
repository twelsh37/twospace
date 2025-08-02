// frontend/app/api/reports/asset-inventory/summary/route.ts
// API route for asset inventory summary reports

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

import { NextRequest, NextResponse } from "next/server";
import { db, assetsTable } from "@/lib/db";
import { isNull, sql } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireUser } from "@/lib/supabase-auth-helpers";

export async function GET(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for viewing reports
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  // Log the start of the GET request
  appLogger.info("GET /api/reports/asset-inventory/summary called");
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
    // Group by type for assets in BUILDING state
    const byTypeInBuildingRows = await db
      .select({ type: assetsTable.type, count: sql<number>`count(*)` })
      .from(assetsTable)
      .where(
        sql`${isNull(assetsTable.deletedAt)} and ${
          assetsTable.state
        } = 'BUILDING'`
      )
      .groupBy(assetsTable.type);
    const byTypeInBuilding: Record<string, number> = {};
    for (const row of byTypeInBuildingRows) {
      byTypeInBuilding[row.type as string] = Number(row.count);
    }
    // Group by type for assets in READY_TO_GO state
    const byTypeInReadyToGoRows = await db
      .select({ type: assetsTable.type, count: sql<number>`count(*)` })
      .from(assetsTable)
      .where(
        sql`${isNull(assetsTable.deletedAt)} and ${
          assetsTable.state
        } = 'READY_TO_GO'`
      )
      .groupBy(assetsTable.type);
    const byTypeInReadyToGo: Record<string, number> = {};
    for (const row of byTypeInReadyToGoRows) {
      byTypeInReadyToGo[row.type as string] = Number(row.count);
    }
    // Group by year (createdAt)
    // This groups assets by the year they were created (createdAt field)
    const byYearRows = await db
      .select({
        year: sql<string>`EXTRACT(YEAR FROM ${assetsTable.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt))
      .groupBy(sql`EXTRACT(YEAR FROM ${assetsTable.createdAt})`);
    const byYear: Record<string, number> = {};
    for (const row of byYearRows) {
      byYear[row.year] = Number(row.count);
    }
    appLogger.info("Aggregated asset-inventory summary", {
      byType,
      byState,
      byTypeInBuilding,
      byTypeInReadyToGo,
      byYear,
    });
    return NextResponse.json({
      byType,
      byState,
      byTypeInBuilding,
      byTypeInReadyToGo,
      byYear,
    });
  } catch (error) {
    systemLogger.error(
      `Error in GET /api/reports/asset-inventory/summary: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
