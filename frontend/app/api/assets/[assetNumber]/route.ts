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
import { eq, desc, isNull, and } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { NextRequest } from "next/server";
import { archivedAssetsTable } from "@/lib/db/schema";
import { assetCache } from "../route";
import { systemLogger, appLogger } from "@/lib/logger";

/**
 * GET /api/assets/{assetNumber}
 * Fetches detailed information for a single asset.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetNumber: string }> }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/assets/[assetNumber] called");
  try {
    const { assetNumber } = await context.params;
    appLogger.info("Fetching asset by assetNumber", { assetNumber });

    if (!assetNumber) {
      appLogger.warn(
        "Asset number is required in GET /api/assets/[assetNumber]"
      );
      return NextResponse.json(
        { error: "Asset number is required" },
        { status: 400 }
      );
    }

    // 1. Try to fetch the asset from the active assets table (not soft deleted)
    const assetResult = await db
      .select({
        ...getTableColumns(assetsTable),
        locationName: locationsTable.name,
      })
      .from(assetsTable)
      .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id))
      .where(
        and(
          eq(assetsTable.assetNumber, assetNumber),
          isNull(assetsTable.deletedAt)
        )
      );

    if (assetResult.length > 0) {
      // Found in active assets
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
        isArchived: false,
      };
      appLogger.info("Fetched asset from active assets table", { assetNumber });
      return NextResponse.json({ success: true, data: assetWithHistory });
    }

    // 2. If not found, try to fetch from archived_assets
    const archivedResult = await db
      .select()
      .from(archivedAssetsTable)
      .where(eq(archivedAssetsTable.assetNumber, assetNumber));
    if (archivedResult.length > 0) {
      const archivedAsset = archivedResult[0];
      // Add archive metadata and flag
      const assetWithArchiveInfo = {
        ...archivedAsset,
        isArchived: true,
        archiveReason: archivedAsset.archiveReason,
        archivedAt: archivedAsset.archivedAt,
        archivedBy: archivedAsset.archivedBy,
      };
      appLogger.info("Fetched asset from archived assets table", {
        assetNumber,
      });
      return NextResponse.json({ success: true, data: assetWithArchiveInfo });
    }

    // Not found in either table
    appLogger.warn("Asset not found in GET /api/assets/[assetNumber]", {
      assetNumber,
    });
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  } catch (error) {
    systemLogger.error(
      `Error fetching asset details: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
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
  // Log the start of the PATCH request
  appLogger.info("PATCH /api/assets/[assetNumber] called");
  try {
    const { assetNumber } = await context.params;
    appLogger.info("Updating asset by assetNumber", { assetNumber });
    if (!assetNumber) {
      appLogger.warn(
        "Asset number is required in PATCH /api/assets/[assetNumber]"
      );
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
      appLogger.warn(
        "No valid fields to update in PATCH /api/assets/[assetNumber]",
        { assetNumber }
      );
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
      appLogger.warn("Asset not found in PATCH /api/assets/[assetNumber]", {
        assetNumber,
      });
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    appLogger.info("Asset updated successfully", { assetNumber });
    return NextResponse.json({ data: updated[0] });
  } catch (error) {
    systemLogger.error(
      `Error updating asset: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
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
  // Log the start of the DELETE request
  appLogger.info("DELETE /api/assets/[assetNumber] called");
  try {
    // Parse assetNumber from route params
    const { assetNumber } = await context.params;
    appLogger.info("Deleting asset by assetNumber", { assetNumber });
    if (!assetNumber) {
      appLogger.warn(
        "Asset number is required in DELETE /api/assets/[assetNumber]"
      );
      return NextResponse.json(
        { error: "Asset number is required" },
        { status: 400 }
      );
    }

    // Parse archiveReason, comment, and userId from request body
    let archiveReason = "Deleted via API";
    let userId = null;
    let comment = "";
    try {
      const body = await request.json();
      archiveReason = body.archiveReason || archiveReason;
      userId = body.userId;
      comment = body.comment || "";
    } catch {
      // If no body or invalid JSON, use defaults
      return NextResponse.json(
        {
          error:
            "Request body with 'archiveReason', 'comment', and 'userId' is required",
        },
        { status: 400 }
      );
    }
    if (!userId) {
      appLogger.warn(
        "'userId' is required in DELETE /api/assets/[assetNumber]",
        { assetNumber }
      );
      return NextResponse.json(
        { error: "'userId' is required in request body" },
        { status: 400 }
      );
    }

    // Fetch the asset to delete
    const assetResult = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.assetNumber, assetNumber));
    if (assetResult.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    const asset = assetResult[0];

    // Soft delete: set deletedAt
    const now = new Date();
    await db
      .update(assetsTable)
      .set({ deletedAt: now })
      .where(eq(assetsTable.assetNumber, assetNumber));

    // Archive: copy to archived_assets with valid state (use previous state or 'holding')
    await db.insert(archivedAssetsTable).values({
      id: asset.id,
      assetNumber: asset.assetNumber,
      type: asset.type,
      state: asset.state, // Keep the last known state for audit
      serialNumber: asset.serialNumber,
      description: asset.description,
      purchasePrice: asset.purchasePrice,
      locationId: asset.locationId,
      assignmentType: asset.assignmentType,
      assignedTo: asset.assignedTo,
      employeeId: asset.employeeId,
      department: asset.department,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      deletedAt: now,
      status: asset.status,
      archivedAt: now,
      archivedBy: userId,
      archiveReason: comment ? `${archiveReason}: ${comment}` : archiveReason,
    });

    // Add to asset_history for audit trail (use previous state and keep newState as previous state for traceability)
    await db.insert(assetHistoryTable).values({
      assetId: asset.id,
      previousState: asset.state,
      newState: asset.state, // Not a real state change, just for audit
      changedBy: userId,
      changeReason: archiveReason,
      timestamp: now,
      details: comment ? { comment } : undefined,
    });

    // Invalidate asset list cache so deleted asset disappears from /assets page
    assetCache.clear();

    // After successful deletion (archive), log the event
    appLogger.info("Asset deleted (archived) successfully", {
      assetNumber,
      userId,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    systemLogger.error(
      `Error deleting asset: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
