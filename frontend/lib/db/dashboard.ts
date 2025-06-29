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

    // --- Canonical state mapping for dashboard cards ---
    // Map all possible state variants (case, spelling) to canonical dashboard states
    const stateVariantMap: Record<string, string> = {
      // Holding/Imported
      holding: "holding",
      imported: "holding",
      HOLDING: "holding",
      IMPORTED: "holding",
      // Available
      available: "AVAILABLE",
      AVAILABLE: "AVAILABLE",
      stock: "AVAILABLE",
      STOCK: "AVAILABLE",
      // Built/Building
      built: "BUILT",
      BUILT: "BUILT",
      building: "BUILT",
      BUILDING: "BUILT",
      // Ready To Go
      ready_to_go: "READY_TO_GO",
      READY_TO_GO: "READY_TO_GO",
      readytogo: "READY_TO_GO",
      "ready-to-go": "READY_TO_GO",
      // Issued/Active
      issued: "ISSUED",
      ISSUED: "ISSUED",
      active: "ISSUED",
      ACTIVE: "ISSUED",
    };

    // Canonical states for dashboard cards (order matters for display)
    const allStates = [
      "holding", // imported/holding
      "AVAILABLE",
      "BUILT",
      "READY_TO_GO",
      "ISSUED",
    ];

    // Aggregate counts for each canonical state
    const stateCounts: Record<string, number> = {};
    for (const row of assetsByStateResult) {
      // Map the DB state to canonical state (default to itself if not mapped)
      const canonical = stateVariantMap[row.state] || row.state;
      if (!stateCounts[canonical]) stateCounts[canonical] = 0;
      stateCounts[canonical] += Number(row.count);
    }
    const assetsByState = allStates.map((state) => ({
      state,
      count: stateCounts[state] || 0,
    }));

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
        assetNumber: activity.assetNumber ?? undefined,
      })),
    };

    return dashboardData;
  });
}
