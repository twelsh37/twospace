// backend/app/api/assets/[assetNumber]/route.ts
// API route for fetching a single asset's details.

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

import { archivedAssetsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";

/**
 * GET /api/assets/{assetNumber}
 * Fetches detailed information for a single asset.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/assets/[assetNumber] called");
  try {
    // Access assetNumber from params (await needed in Next.js 15)
    const { assetNumber } = await params;
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
  request: Request,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  // Log the start of the PATCH request
  appLogger.info("PATCH /api/assets/[assetNumber] called");
  try {
    // Access assetNumber from params (await needed in Next.js 15)
    const { assetNumber } = await params;
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
  request: Request,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  // Log the start of the DELETE request
  appLogger.info("DELETE /api/assets/[assetNumber] called");
  try {
    // Access assetNumber from params (await needed in Next.js 15)
    const { assetNumber } = await params;
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
    // Soft delete: set deletedAt timestamp
    const deleted = await db
      .update(assetsTable)
      .set({ deletedAt: new Date() })
      .where(eq(assetsTable.assetNumber, assetNumber))
      .returning();
    if (!deleted.length) {
      appLogger.warn("Asset not found in DELETE /api/assets/[assetNumber]", {
        assetNumber,
      });
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    appLogger.info("Asset deleted successfully", { assetNumber });
    return NextResponse.json({ data: deleted[0] });
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
