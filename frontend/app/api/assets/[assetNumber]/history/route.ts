// frontend/app/api/assets/[assetNumber]/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetHistoryTable, assetsTable, usersTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
    // Get asset UUID by asset number
    const assetResult = await db
      .select({ id: assetsTable.id })
      .from(assetsTable)
      .where(eq(assetsTable.assetNumber, assetNumber));
    if (!assetResult.length) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    const assetId = assetResult[0].id;
    // Fetch asset history, join with users for names
    const history = await db
      .select({
        previousState: assetHistoryTable.previousState,
        newState: assetHistoryTable.newState,
        changedBy: assetHistoryTable.changedBy,
        changeReason: assetHistoryTable.changeReason,
        timestamp: assetHistoryTable.timestamp,
        userName: usersTable.name,
      })
      .from(assetHistoryTable)
      .leftJoin(usersTable, eq(assetHistoryTable.changedBy, usersTable.id))
      .where(eq(assetHistoryTable.assetId, assetId))
      .orderBy(desc(assetHistoryTable.timestamp));
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching asset history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch asset history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
