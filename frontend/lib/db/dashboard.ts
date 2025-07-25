// frontend/lib/db/dashboard.ts

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

// Shared dashboard data fetching logic for both API and server components

import { db } from "./index";
import {
  assetsTable,
  assetHistoryTable,
  usersTable,
  locationsTable,
  holdingAssetsTable, // Add this import
} from "./schema";
import { desc, count, eq, sum } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function getDashboardData() {
  // Log function entry
  appLogger.info("getDashboardData called");
  try {
    // A transaction ensures all queries are consistent and uses a single connection,
    // which can prevent connection limit issues on some database providers.
    return await db.transaction(async (tx) => {
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

      // Add query for pending holding assets
      const pendingHoldingResult = await tx
        .select({ count: count() })
        .from(holdingAssetsTable)
        .where(eq(holdingAssetsTable.status, "pending"));
      const pendingHoldingCount = pendingHoldingResult[0]?.count || 0;

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
        building: "BUILDING",
        BUILDING: "BUILDING",
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
        "BUILDING",
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

      // --- Add buildingByType: count of assets in 'BUILDING' state, grouped by type ---
      const buildingResults = await tx
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
      const buildingTypeCounts: Record<string, number> = {};
      for (const row of buildingResults) {
        const type = (row.type || "").toUpperCase();
        buildingTypeCounts[type] = (buildingTypeCounts[type] || 0) + 1;
      }
      const buildingByType = ALL_TYPES.map((type) => ({
        type,
        count: buildingTypeCounts[type] || 0,
      }));

      // --- Add readyToGoByType: count of assets in 'READY_TO_GO' state, grouped by type ---
      const readyToGoResults = await tx
        .select({ type: assetsTable.type })
        .from(assetsTable)
        .where(eq(assetsTable.state, "READY_TO_GO"));
      const readyToGoTypeCounts: Record<string, number> = {};
      for (const row of readyToGoResults) {
        const type = (row.type || "").toUpperCase();
        readyToGoTypeCounts[type] = (readyToGoTypeCounts[type] || 0) + 1;
      }
      const readyToGoByType = ALL_TYPES.map((type) => ({
        type,
        count: readyToGoTypeCounts[type] || 0,
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
        pendingHoldingCount, // Add this field
        buildingByType, // Add this field for SSR
        readyToGoByType, // Add this field for SSR
      };

      // After all queries, log summary counts
      appLogger.info("Dashboard data fetched", {
        totalAssets: totalAssetsResult[0]?.value || 0,
        totalUsers: totalUsersResult[0]?.value || 0,
        totalLocations: totalLocationsResult[0]?.value || 0,
        pendingHoldingCount,
      });
      return dashboardData;
    });
  } catch (error) {
    systemLogger.error(
      `Error in getDashboardData: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    throw error;
  }
}
