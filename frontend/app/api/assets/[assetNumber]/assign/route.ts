// frontend/app/api/assets/[assetNumber]/assign/route.ts
// API route for assigning assets to users

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
import { db } from "@/lib/db";
import { assetsTable, usersTable, assetHistoryTable } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireUser } from "@/lib/supabase-auth-helpers";
import { appLogger, systemLogger } from "@/lib/logger";

/**
 * POST /api/assets/{assetNumber}/assign
 * Assigns an asset to a user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  appLogger.info("POST /api/assets/[assetNumber]/assign called");

  try {
    // Check authentication (both admin and user roles can assign assets)
    const authResult = await requireUser(request);
    if (authResult.error || !authResult.data.user) {
      appLogger.warn("Unauthorized access attempt to assign asset");
      return NextResponse.json(
        { error: authResult.error?.message || "Unauthorized" },
        { status: 401 }
      );
    }
    const user = authResult.data.user;

    // Get asset number from params
    const { assetNumber } = await params;
    appLogger.info("Assigning asset", { assetNumber });

    if (!assetNumber) {
      appLogger.warn("Asset number is required for assignment");
      return NextResponse.json(
        { error: "Asset number is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      appLogger.warn("User ID is required for asset assignment");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify the asset exists and is available for assignment
    const assetResult = await db
      .select()
      .from(assetsTable)
      .where(
        and(
          eq(assetsTable.assetNumber, assetNumber),
          isNull(assetsTable.deletedAt),
          isNull(assetsTable.assignedTo), // Not already assigned
          eq(assetsTable.state, "READY_TO_GO") // Ready to be assigned
        )
      );

    if (assetResult.length === 0) {
      appLogger.warn("Asset not found or not available for assignment", {
        assetNumber,
      });
      return NextResponse.json(
        { error: "Asset not found or not available for assignment" },
        { status: 404 }
      );
    }

    const asset = assetResult[0];

    // Check if asset is already assigned
    if (asset.assignedTo) {
      appLogger.warn("Asset is already assigned", {
        assetNumber,
        currentAssignee: asset.assignedTo,
      });
      return NextResponse.json(
        { error: "Asset is already assigned to another user" },
        { status: 409 }
      );
    }

    // Verify the user exists
    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (userResult.length === 0) {
      appLogger.warn("User not found for asset assignment", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the asset to assign it to the user
    const updatedAsset = await db
      .update(assetsTable)
      .set({
        assignedTo: userId,
        state: "ISSUED",
        updatedAt: new Date(),
      })
      .where(eq(assetsTable.assetNumber, assetNumber))
      .returning();

    if (updatedAsset.length === 0) {
      appLogger.error("Failed to update asset assignment", { assetNumber });
      return NextResponse.json(
        { error: "Failed to assign asset" },
        { status: 500 }
      );
    }

    // Get the database user ID for the user making the assignment
    const dbUserResult = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, user.email || ""))
      .limit(1);

    const dbUserId = dbUserResult.length > 0 ? dbUserResult[0].id : null;

    // Log the assignment in asset history (only if we have a valid database user ID)
    if (dbUserId) {
      await db.insert(assetHistoryTable).values({
        assetId: asset.id,
        previousState: asset.state,
        newState: "ISSUED",
        changedBy: dbUserId,
        changeReason: `Asset assigned to user ${userId}`,
        details: {
          assignedTo: userId,
          assignmentType: "INDIVIDUAL",
        },
      });
    } else {
      appLogger.warn(
        "Could not find database user ID for asset history logging",
        {
          supabaseUserId: user.id,
          userEmail: user.email,
        }
      );
    }

    appLogger.info("Asset assigned successfully", {
      assetNumber,
      assignedTo: userId,
      assignedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Asset assigned successfully",
      data: updatedAsset[0],
    });
  } catch (error) {
    systemLogger.error(
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
      { status: 500 }
    );
  }
}
