// frontend/app/api/assets/[assetNumber]/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetHistoryTable, assetsTable, usersTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  context: { params: { assetNumber: string } }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/assets/[assetNumber]/history called");
  try {
    const { assetNumber } = context.params;
    appLogger.info("Fetching asset history by assetNumber", { assetNumber });
    if (!assetNumber) {
      appLogger.warn(
        "Asset number is required in GET /api/assets/[assetNumber]/history"
      );
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
      appLogger.warn(
        "Asset not found in GET /api/assets/[assetNumber]/history",
        { assetNumber }
      );
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
    appLogger.info("Fetched asset history successfully", {
      assetNumber,
      count: history.length,
    });
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    systemLogger.error(
      `Error fetching asset history: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
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
