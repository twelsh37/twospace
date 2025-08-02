// frontend/app/api/assets/[assetNumber]/unassign/route.ts

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
import { assetsTable, assetHistoryTable, usersTable } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireUser } from "@/lib/supabase-auth-helpers";
import { appLogger } from "@/lib/logger";

interface UnassignRequest {
  userId: string;
  disposition: "RESTOCK" | "RECYCLE";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  try {
    // Check authentication (both admin and user roles can unassign assets)
    const authResult = await requireUser(request);
    if (authResult.error || !authResult.data.user) {
      appLogger.warn("Unauthorized access attempt to unassign asset");
      return NextResponse.json(
        { success: false, error: authResult.error?.message || "Unauthorized" },
        { status: 401 }
      );
    }
    const user = authResult.data.user;

    const { assetNumber } = await params;
    const body: UnassignRequest = await request.json();
    const { userId, disposition } = body;

    appLogger.info(`Unassigning asset ${assetNumber} from user ${userId} with disposition: ${disposition}`);

    // Get the database user ID for the authenticated user (for asset history logging)
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email || ""))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      appLogger.error(`Database user not found for email: ${user.email}`);
      return NextResponse.json(
        { success: false, error: "Database user not found" },
        { status: 404 }
      );
    }

    const dbUserId = dbUser[0].id;

    // Get the asset to verify it exists and is assigned to the user
    const asset = await db
      .select()
      .from(assetsTable)
      .where(
        and(
          eq(assetsTable.assetNumber, assetNumber),
          eq(assetsTable.assignedTo, userId),
          isNull(assetsTable.deletedAt)
        )
      )
      .limit(1);

    if (!asset || asset.length === 0) {
      appLogger.error(`Asset ${assetNumber} not found or not assigned to user ${userId}`);
      return NextResponse.json(
        { success: false, error: "Asset not found or not assigned to user" },
        { status: 404 }
      );
    }

    const assetData = asset[0];

    // Get the user for logging purposes
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const userName = userData[0]?.name || "Unknown User";

    // Determine the new state based on disposition
    let newState: "AVAILABLE" | "RECYCLED";
    let newStatus: "ACTIVE" | "RECYCLED";

    if (disposition === "RESTOCK") {
      newState = "AVAILABLE";
      newStatus = "ACTIVE";
    } else if (disposition === "RECYCLE") {
      newState = "AVAILABLE"; // Keep as AVAILABLE but mark as RECYCLED status
      newStatus = "RECYCLED";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid disposition" },
        { status: 400 }
      );
    }

    // Update the asset
    await db
      .update(assetsTable)
      .set({
        assignedTo: null,
        employeeId: null,
        department: null,
        state: newState,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(assetsTable.assetNumber, assetNumber));

    // Log the change in asset history
    await db.insert(assetHistoryTable).values({
      assetId: assetData.id,
      previousState: assetData.state,
      newState: newState,
      changedBy: dbUserId,
      changeReason: `Asset unassigned from ${userName} and ${disposition.toLowerCase()}ed`,
      details: {
        oldValue: {
          assignedTo: assetData.assignedTo,
          employeeId: assetData.employeeId,
          department: assetData.department,
          state: assetData.state,
          status: assetData.status,
        },
        newValue: {
          assignedTo: null,
          employeeId: null,
          department: null,
          state: newState,
          status: newStatus,
          disposition: disposition,
        },
      },
    });

    appLogger.info(`Successfully unassigned asset ${assetNumber} from user ${userId} with disposition: ${disposition}`);

    return NextResponse.json({
      success: true,
      message: `Asset ${assetNumber} unassigned successfully`,
      disposition: disposition,
    });

  } catch (error) {
    appLogger.error("Error unassigning asset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unassign asset" },
      { status: 500 }
    );
  }
} 