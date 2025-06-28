// frontend/lib/db/dashboard.ts
// Shared dashboard data fetching logic for both API and server components

import { db } from "./index";
import {
  assetsTable,
  assetHistoryTable,
  usersTable,
  locationsTable,
} from "./schema";
import { desc, count, eq, sum } from "drizzle-orm";

export async function getDashboardData() {
  // A transaction ensures all queries are consistent and uses a single connection,
  // which can prevent connection limit issues on some database providers.
  return db.transaction(async (tx) => {
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
        state: assetsTable.status,
        count: count(),
      })
      .from(assetsTable)
      .groupBy(assetsTable.status);

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
        assetNumber: assetsTable.assetNumber,
        newState: assetHistoryTable.newState,
        type: assetsTable.type,
        changeReason: assetHistoryTable.changeReason,
        timestamp: assetHistoryTable.timestamp,
        userName: usersTable.name,
        assetDescription: assetsTable.description,
      })
      .from(assetHistoryTable)
      .leftJoin(usersTable, eq(assetHistoryTable.changedBy, usersTable.id))
      .leftJoin(assetsTable, eq(assetHistoryTable.assetId, assetsTable.id))
      .orderBy(desc(assetHistoryTable.timestamp))
      .limit(5);

    // Ensure all possible statuses are present, even if count is zero
    const allStatuses = ["holding", "active", "retired", "stock"];
    const assetsByState = allStatuses.map((status) => {
      const found = assetsByStateResult.find((s) => s.state === status);
      return { state: status, count: found ? found.count : 0 };
    });

    // Format the results
    const dashboardData = {
      totalAssets: totalAssetsResult[0]?.value || 0,
      totalValue: parseFloat(totalValueResult[0]?.value || "0"),
      totalUsers: totalUsersResult[0]?.value || 0,
      totalLocations: totalLocationsResult[0]?.value || 0,
      assetsByState,
      assetsByType: assetsByTypeResult,
      recentActivity: recentActivityResult.map((activity) => ({
        ...activity,
        userName: activity.userName || "System",
        type: activity.type ? String(activity.type) : "",
        timestamp: activity.timestamp
          ? new Date(activity.timestamp).toISOString()
          : "",
      })),
    };

    return dashboardData;
  });
}
