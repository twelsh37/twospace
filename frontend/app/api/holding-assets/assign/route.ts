// frontend/app/api/holding-assets/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  db,
  holdingAssetsTable,
  assetsTable,
  assetHistoryTable,
} from "@/lib/db";
import { eq } from "drizzle-orm";

const IT_STORE_ROOM_ID = "0d964e1a-fabd-4833-9dad-aadab0ea1e1e";

// Helper to parse asset type from asset number prefix
function getAssetTypeFromNumber(assetNumber: string): string | null {
  const prefix = assetNumber.slice(0, 2);
  switch (prefix) {
    case "01":
      return "MOBILE_PHONE";
    case "02":
      return "TABLET";
    case "03":
      return "LAPTOP";
    case "04":
      return "DESKTOP";
    case "05":
      return "MONITOR";
    default:
      return null;
  }
}

// Utility to robustly convert a value to ISO string
function toIsoStringSafe(val: unknown): string {
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  if (
    val &&
    typeof val === "object" &&
    "toISOString" in val &&
    typeof (val as any).toISOString === "function"
  ) {
    try {
      return (val as any).toISOString();
    } catch {}
  }
  if (val !== undefined && val !== null) {
    console.warn(
      "[assign] Unexpected createdAt value:",
      val,
      "type:",
      typeof val
    );
  }
  return new Date().toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const { holdingAssetId, assetNumber, userId, type } = await req.json();
    // Validate type
    const validTypes = [
      "MOBILE_PHONE",
      "TABLET",
      "DESKTOP",
      "LAPTOP",
      "MONITOR",
    ];
    if (!type || !validTypes.includes(type)) {
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
        type, // Use the provided type from the request
        state: "AVAILABLE",
        serialNumber: holdingAsset[0].serialNumber,
        description: holdingAsset[0].description,
        purchasePrice: "0.00",
        locationId:
          holdingAsset[0].locationId || "0d964e1a-fabd-4833-9dad-aadab0ea1e1e",
        assignmentType: "INDIVIDUAL",
        createdAt: holdingAsset[0].createdAt
          ? new Date(holdingAsset[0].createdAt)
          : new Date(),
        updatedAt: new Date(),
        status: "stock",
        // Do NOT include rawData or notes here
      };
      console.log("[assign] Inserting asset:", assetInsert);
      await trx.insert(assetsTable).values(assetInsert);
      // Prepare asset history insert object
      const assetHistoryInsert = {
        assetId: holdingAsset[0].id,
        previousState: null,
        newState: "AVAILABLE",
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
      console.log("[assign] Inserting asset history:", assetHistoryInsert);
      await trx.insert(assetHistoryTable).values(assetHistoryInsert);
      // Remove from holding_assets (ensure correct id and log result)
      const deleteResult = await trx
        .delete(holdingAssetsTable)
        .where(eq(holdingAssetsTable.id, holdingAssetId));
      if (deleteResult.rowCount === 0) {
        console.warn(
          `Warning: Asset ${holdingAssetId} was not removed from holding_assets after assignment.`
        );
      }
    });
    // Optionally, confirm removal after transaction
    const stillExists = await db
      .select()
      .from(holdingAssetsTable)
      .where(eq(holdingAssetsTable.id, holdingAssetId))
      .limit(1);
    if (stillExists.length > 0) {
      console.warn(
        `Warning: Asset ${holdingAssetId} still exists in holding_assets after assignment.`
      );
    }
    return NextResponse.json(
      { message: "Asset assigned and moved successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in assign asset:", err);
    return NextResponse.json(
      { error: "Failed to assign asset. " + (err?.message || err) },
      { status: 500 }
    );
  }
}
