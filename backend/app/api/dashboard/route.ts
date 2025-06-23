// backend/app/api/dashboard/route.ts
// API route to fetch aggregated data for the main dashboard.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  assetsTable,
  assetHistoryTable,
  usersTable,
  locationsTable,
} from "@/lib/db/schema";
import { desc, count, eq, sum } from "drizzle-orm";

/**
 * GET /api/dashboard
 * Retrieves all the necessary statistics for the dashboard in a single request.
 */
export async function GET() {
  try {
    // A transaction ensures all queries are consistent and uses a single connection,
    // which can prevent connection limit issues on some database providers.
    const dashboardData = await db.transaction(async (tx) => {
      const totalAssetsResult = await tx
        .select({ value: count() })
        .from(assetsTable);

      const totalValueResult = await tx
        .select({ value: sum(assetsTable.purchasePrice) })
        .from(assetsTable);

      const totalUsersResult = await tx
        .select({ value: count() })
        .from(usersTable);

      const totalLocationsResult = await tx
        .select({ value: count() })
        .from(locationsTable);

      const assetsByStateResult = await tx
        .select({
          state: assetsTable.state,
          count: count(),
        })
        .from(assetsTable)
        .groupBy(assetsTable.state);

      const assetsByTypeResult = await tx
        .select({
          type: assetsTable.type,
          count: count(),
        })
        .from(assetsTable)
        .groupBy(assetsTable.type);

      const recentActivityResult = await tx
        .select({
          id: assetHistoryTable.id,
          assetId: assetHistoryTable.assetId,
          newState: assetHistoryTable.newState,
          type: assetsTable.type,
          changeReason: assetHistoryTable.changeReason,
          timestamp: assetHistoryTable.timestamp,
          userName: usersTable.name,
          assetDescription: assetsTable.description,
        })
        .from(assetHistoryTable)
        .leftJoin(usersTable, eq(assetHistoryTable.changedBy, usersTable.id))
        .leftJoin(
          assetsTable,
          eq(assetHistoryTable.assetId, assetsTable.assetNumber)
        )
        .orderBy(desc(assetHistoryTable.timestamp))
        .limit(5);

      // Format the results
      const dashboardData = {
        totalAssets: totalAssetsResult[0]?.value || 0,
        totalValue: parseFloat(totalValueResult[0]?.value || "0"),
        totalUsers: totalUsersResult[0]?.value || 0,
        totalLocations: totalLocationsResult[0]?.value || 0,
        assetsByState: assetsByStateResult,
        assetsByType: assetsByTypeResult,
        recentActivity: recentActivityResult.map((activity) => ({
          ...activity,
          userName: activity.userName || "System",
        })),
      };

      return dashboardData;
    });

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
