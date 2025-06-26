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
import { NextRequest } from "next/server";

/**
 * GET /api/assets/{assetNumber}
 * Fetches detailed information for a single asset.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetNumber: string }> }
) {
  try {
    const { assetNumber } = await context.params;

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

    // Fetch the last update history for the asset using its UUID id
    const lastHistory = await db
      .select({ updatedBy: usersTable.name })
      .from(assetHistoryTable)
      .leftJoin(usersTable, eq(assetHistoryTable.changedBy, usersTable.id))
      .where(eq(assetHistoryTable.assetId, asset.id))
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ assetNumber: string }> }
) {
  try {
    const { assetNumber } = await context.params;
    if (!assetNumber) {
      return NextResponse.json(
        { error: "Asset number is required" },
        { status: 400 }
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    // Only allow updating fields that exist in the assetsTable
    const allowedFields = [
      "type",
      "state",
      "serialNumber",
      "description",
      "purchasePrice",
      "locationId",
      "department",
      "assignedTo",
      "employeeId",
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    const updated = await db
      .update(assetsTable)
      .set(updateData)
      .where(eq(assetsTable.assetNumber, assetNumber))
      .returning();
    if (!updated.length) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ data: updated[0] });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ assetNumber: string }> }
) {
  try {
    const { assetNumber } = await context.params;
    if (!assetNumber) {
      return NextResponse.json(
        { error: "Asset number is required" },
        { status: 400 }
      );
    }
    const deleted = await db
      .delete(assetsTable)
      .where(eq(assetsTable.assetNumber, assetNumber))
      .returning();
    if (!deleted.length) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
