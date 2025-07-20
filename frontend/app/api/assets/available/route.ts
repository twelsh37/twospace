// frontend/app/api/assets/available/route.ts
// API endpoint to fetch available (unassigned) assets for assignment

import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, and } from "drizzle-orm";
import { db, assetsTable, locationsTable } from "@/lib/db";
import { appLogger } from "@/lib/logger";
import { requireAdmin } from "@/lib/supabase-auth-helpers";

// Define standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * GET /api/assets/available
 * Retrieve all available (unassigned) assets grouped by type
 */
export async function GET(request: NextRequest) {
  appLogger.info("GET /api/assets/available called");

  try {
    // Verify admin access
    const authResult = await requireAdmin(request);
    if (authResult.error || !authResult.data.user) {
      appLogger.warn("Unauthorized access attempt to /api/assets/available");
      return NextResponse.json(
        { success: false, error: authResult.error?.message || "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch all available (unassigned) assets with location details
    const availableAssets = await db
      .select({
        id: assetsTable.id,
        assetNumber: assetsTable.assetNumber,
        type: assetsTable.type,
        description: assetsTable.description,
        state: assetsTable.state,
        status: assetsTable.status,
        location: locationsTable.name,
        locationId: assetsTable.locationId,
        serialNumber: assetsTable.serialNumber,
        createdAt: assetsTable.createdAt,
      })
      .from(assetsTable)
      .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id))
      .where(
        and(
          isNull(assetsTable.deletedAt), // Not deleted
          isNull(assetsTable.assignedTo), // Not assigned to anyone
          eq(assetsTable.state, "READY_TO_GO") // Ready to be assigned
        )
      )
      .orderBy(assetsTable.type, assetsTable.assetNumber);

    appLogger.info(`Found ${availableAssets.length} available assets`);

    // Group assets by type
    const assetsByType = availableAssets.reduce((acc, asset) => {
      if (!acc[asset.type]) {
        acc[asset.type] = [];
      }
      acc[asset.type].push({
        id: asset.id,
        assetNumber: asset.assetNumber,
        type: asset.type,
        description: asset.description,
        state: asset.state,
        location: asset.location || "Unknown",
        serialNumber: asset.serialNumber,
        createdAt: asset.createdAt,
      });
      return acc;
    }, {} as Record<string, Array<{
      id: string;
      assetNumber: string | null;
      type: string;
      description: string;
      state: string;
      location: string;
      serialNumber: string;
      createdAt: Date | null;
    }>>);

    return NextResponse.json(
      {
        success: true,
        assets: availableAssets,
        assetsByType,
        totalCount: availableAssets.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    appLogger.error(
      `Error fetching available assets: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available assets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
