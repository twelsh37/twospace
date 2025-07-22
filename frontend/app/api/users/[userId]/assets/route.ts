// frontend/app/api/users/[userId]/assets/route.ts
// API route for user assets

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
import { eq, and, isNull } from "drizzle-orm";
import { db, assetsTable, usersTable } from "@/lib/db";
import { createAssetHistory } from "@/lib/db/utils";
import { appLogger } from "@/lib/logger";
import { requireAdmin } from "@/lib/supabase-auth-helpers";

// Define standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * POST /api/users/[userId]/assets
 * Assign an asset to a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  appLogger.info(`POST /api/users/${userId}/assets called`);

  try {
    // Verify admin access
    const authResult = await requireAdmin(request);
    if (authResult.error || !authResult.data.user) {
      appLogger.warn("Unauthorized access attempt to assign assets");
      return NextResponse.json(
        { success: false, error: authResult.error?.message || "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    const user = authResult.data.user;
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      appLogger.warn("Missing assetId in request body");
      return NextResponse.json(
        { success: false, error: "Missing assetId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify user exists
    const userExists = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      appLogger.warn(`User not found: ${userId}`);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Verify asset exists and is available
    const assetExists = await db
      .select({
        id: assetsTable.id,
        assetNumber: assetsTable.assetNumber,
        type: assetsTable.type,
        description: assetsTable.description,
        state: assetsTable.state,
        status: assetsTable.status,
        assignedTo: assetsTable.assignedTo,
      })
      .from(assetsTable)
      .where(
        and(
          eq(assetsTable.id, assetId),
          isNull(assetsTable.deletedAt),
          isNull(assetsTable.assignedTo), // Not already assigned
          eq(assetsTable.state, "READY_TO_GO") // Ready to be assigned (status can be HOLDING for stock assets)
        )
      )
      .limit(1);

    if (assetExists.length === 0) {
      appLogger.warn(`Asset not found or not available: ${assetId}`);
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found or not available for assignment",
        },
        { status: 404, headers: corsHeaders }
      );
    }

    const asset = assetExists[0];

    // Update asset assignment
    await db
      .update(assetsTable)
      .set({
        assignedTo: userId,
        state: "ISSUED",
        updatedAt: new Date(),
      })
      .where(eq(assetsTable.id, assetId));

    // Create asset history record
    await createAssetHistory(
      assetId,
      "ISSUED",
      user.id,
      `Assigned to user: ${userExists[0].name} (${userId})`,
      asset.state,
      { assignmentType: "INDIVIDUAL", assignedTo: userId }
    );

    appLogger.info(
      `Asset ${asset.assetNumber} successfully assigned to user ${userId}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Asset assigned successfully",
        asset: {
          id: asset.id,
          assetNumber: asset.assetNumber,
          type: asset.type,
          description: asset.description,
        },
        user: {
          id: userId,
          name: userExists[0].name,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    appLogger.error(
      `Error assigning asset: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to assign asset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/users/[userId]/assets
 * Get all assets assigned to a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  appLogger.info(`GET /api/users/${userId}/assets called`);

  try {
    // Verify admin access
    const authResult = await requireAdmin(request);
    if (authResult.error || !authResult.data.user) {
      appLogger.warn("Unauthorized access attempt to get user assets");
      return NextResponse.json(
        { success: false, error: authResult.error?.message || "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get all assets assigned to the user
    const userAssets = await db
      .select({
        id: assetsTable.id,
        assetNumber: assetsTable.assetNumber,
        type: assetsTable.type,
        description: assetsTable.description,
        state: assetsTable.state,
        status: assetsTable.status,
        serialNumber: assetsTable.serialNumber,
        assignedTo: assetsTable.assignedTo,
        createdAt: assetsTable.createdAt,
        updatedAt: assetsTable.updatedAt,
      })
      .from(assetsTable)
      .where(
        and(eq(assetsTable.assignedTo, userId), isNull(assetsTable.deletedAt))
      )
      .orderBy(assetsTable.type, assetsTable.assetNumber);

    appLogger.info(
      `Found ${userAssets.length} assets assigned to user ${userId}`
    );

    return NextResponse.json(
      {
        success: true,
        assets: userAssets,
        totalCount: userAssets.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    appLogger.error(
      `Error fetching user assets: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user assets",
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
