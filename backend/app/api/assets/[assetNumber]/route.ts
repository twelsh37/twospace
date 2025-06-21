// backend/app/api/assets/[assetNumber]/route.ts
// API route for fetching a single asset's details.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  assetsTable,
  usersTable,
  locationsTable,
  assetHistoryTable,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";

type RouteContext = {
  params: {
    assetNumber: string;
  };
};

/**
 * GET /api/assets/{assetNumber}
 * Fetches detailed information for a single asset.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { assetNumber } = context.params;

    if (!assetNumber) {
      return NextResponse.json(
        { error: "Asset number is required" },
        { status: 400 }
      );
    }

    // Fetch the main asset details and join with location
    const assetResult = await db
      .select({
        ...getTableColumns(assetsTable),
        locationName: locationsTable.name,
      })
      .from(assetsTable)
      .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id))
      .where(eq(assetsTable.assetNumber, assetNumber));

    if (assetResult.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    const asset = assetResult[0];

    // Fetch the last update history for the asset
    const lastHistory = await db
      .select({ updatedBy: usersTable.name })
      .from(assetHistoryTable)
      .leftJoin(usersTable, eq(assetHistoryTable.changedBy, usersTable.id))
      .where(eq(assetHistoryTable.assetId, asset.assetNumber))
      .orderBy(desc(assetHistoryTable.timestamp))
      .limit(1);

    const assetWithHistory = {
      ...asset,
      updatedByName: lastHistory[0]?.updatedBy || "System",
    };

    return NextResponse.json({ success: true, data: assetWithHistory });
  } catch (error) {
    console.error("Error fetching asset details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch asset details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
