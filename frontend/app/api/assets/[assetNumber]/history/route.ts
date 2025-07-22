// frontend/app/api/assets/[assetNumber]/history/route.ts
// API route for fetching asset history

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
import { assetHistoryTable, assetsTable, usersTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetNumber: string }> }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/assets/[assetNumber]/history called");
  try {
    const { assetNumber } = await params;
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
