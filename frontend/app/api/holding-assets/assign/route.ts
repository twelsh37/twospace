// frontend/app/api/holding-assets/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  db,
  holdingAssetsTable,
  assetsTable,
  assetHistoryTable,
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

// Remove unused: IT_STORE_ROOM_ID, getAssetTypeFromNumber, toIsoStringSafe

export async function POST(req: NextRequest) {
  // Log the start of the POST request
  appLogger.info("POST /api/holding-assets/assign called");
  try {
    const { holdingAssetId, assetNumber, userId, type } = await req.json();
    appLogger.info("Assigning holding asset", {
      holdingAssetId,
      assetNumber,
      userId,
      type,
    });
    // Validate type
    const validTypes = [
      "MOBILE_PHONE",
      "TABLET",
      "DESKTOP",
      "LAPTOP",
      "MONITOR",
    ];
    if (!type || !validTypes.includes(type)) {
      appLogger.warn("Invalid or missing asset type in assign", { type });
      return NextResponse.json(
        { error: "Invalid or missing asset type." },
        { status: 400 }
      );
    }
    // 1. Check if the holding asset exists and is unassigned
    const holdingAsset = await db
      .select()
      .from(holdingAssetsTable)
      .where(eq(holdingAssetsTable.id, holdingAssetId))
      .limit(1);
    if (!holdingAsset.length) {
      appLogger.warn("Holding asset not found or already assigned", {
        holdingAssetId,
      });
      return NextResponse.json(
        { error: "Holding asset not found or already assigned." },
        { status: 400 }
      );
    }
    // 2. Check for duplicate asset number or serial number in assets table
    const existingAsset = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.assetNumber, assetNumber))
      .limit(1);
    if (existingAsset.length) {
      appLogger.warn("Asset number already exists in assets table", {
        assetNumber,
      });
      return NextResponse.json(
        { error: "Asset number already exists in assets table." },
        { status: 400 }
      );
    }
    const existingSerial = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.serialNumber, holdingAsset[0].serialNumber))
      .limit(1);
    if (existingSerial.length) {
      appLogger.warn("Serial number already exists in assets table", {
        serialNumber: holdingAsset[0].serialNumber,
      });
      return NextResponse.json(
        { error: "Serial number already exists in assets table." },
        { status: 400 }
      );
    }
    // 3. Use a transaction for atomicity
    await db.transaction(async (trx) => {
      // Prepare asset insert object (only include fields defined in assetsTable)
      const assetInsert = {
        id: holdingAsset[0].id,
        assetNumber,
        type: type as (typeof assetsTable.$inferInsert)["type"],
        state: "AVAILABLE" as (typeof assetsTable.$inferInsert)["state"],
        serialNumber: holdingAsset[0].serialNumber,
        description: holdingAsset[0].description,
        purchasePrice: "0.00",
        locationId: "0d964e1a-fabd-4833-9dad-aadab0ea1e1e",
        assignmentType:
          "INDIVIDUAL" as (typeof assetsTable.$inferInsert)["assignmentType"],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "stock" as (typeof assetsTable.$inferInsert)["status"],
        // Do NOT include rawData or notes here
      };
      appLogger.info("Inserting asset in assign transaction", { assetInsert });
      await trx.insert(assetsTable).values(assetInsert);
      // Prepare asset history insert object
      const assetHistoryInsert = {
        assetId: holdingAsset[0].id,
        previousState: null,
        newState:
          "AVAILABLE" as (typeof assetHistoryTable.$inferInsert)["newState"],
        changedBy: userId,
        changeReason: "Asset assigned number and moved from holding_assets",
        timestamp: new Date(), // Pass Date object, not string
        details: JSON.stringify({
          assetNumber,
          description: holdingAsset[0].description,
          serialNumber: holdingAsset[0].serialNumber,
          type,
        }), // Use correct type
      };
      appLogger.info("Inserting asset history in assign transaction", {
        assetHistoryInsert,
      });
      await trx.insert(assetHistoryTable).values(assetHistoryInsert);
      // Remove from holding_assets (ensure correct id and log result)
      const deleteResult = await trx
        .delete(holdingAssetsTable)
        .where(eq(holdingAssetsTable.id, holdingAssetId));
      appLogger.info("Deleted holding asset in assign transaction", {
        holdingAssetId,
        deleteResult,
      });
    });
    // Optionally, confirm removal after transaction
    const stillExists = await db
      .select()
      .from(holdingAssetsTable)
      .where(eq(holdingAssetsTable.id, holdingAssetId))
      .limit(1);
    if (stillExists.length > 0) {
      systemLogger.warn(
        `Warning: Asset ${holdingAssetId} still exists in holding_assets after assignment.`
      );
    }
    appLogger.info("Asset assigned and moved successfully", {
      holdingAssetId,
      assetNumber,
    });
    return NextResponse.json(
      { message: "Asset assigned and moved successfully." },
      { status: 200 }
    );
  } catch (err) {
    systemLogger.error(
      `Error in assign asset: ${err instanceof Error ? err.stack : String(err)}`
    );
    return NextResponse.json(
      {
        error:
          "Failed to assign asset. " +
          (err instanceof Error ? err.message : String(err)),
      },
      { status: 500 }
    );
  }
}
