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

export async function POST(req: NextRequest) {
  try {
    const { holdingAssetId, assetNumber, userId } = await req.json();

    // Fetch holding asset
    const holdingAsset = await db.query.holdingAssetsTable.findFirst({
      where: eq(holdingAssetsTable.id, holdingAssetId),
    });
    if (!holdingAsset) {
      return NextResponse.json(
        { error: "Holding asset not found." },
        { status: 404 }
      );
    }

    // Parse asset type from asset number
    const type = getAssetTypeFromNumber(assetNumber);
    if (!type) {
      return NextResponse.json(
        { error: "Invalid asset number prefix. Cannot determine type." },
        { status: 400 }
      );
    }

    // Check asset number uniqueness
    const existing = await db.query.assetsTable.findFirst({
      where: eq(assetsTable.assetNumber, assetNumber),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Asset number already exists." },
        { status: 400 }
      );
    }

    // Move to assets table
    await db.insert(assetsTable).values({
      id: holdingAsset.id,
      assetNumber,
      serialNumber: holdingAsset.serialNumber,
      description: holdingAsset.description,
      type: type as (typeof assetsTable.$inferInsert)["type"], // Safe: validated above
      purchasePrice: "0.00", // Default, or prompt for price if needed
      locationId: IT_STORE_ROOM_ID,
      state: "AVAILABLE",
      assignmentType: "INDIVIDUAL",
      status: "stock",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as typeof assetsTable.$inferInsert); // Type assertion needed to allow explicit id and union type

    // Log in asset history
    await db.insert(assetHistoryTable).values({
      assetId: holdingAsset.id,
      previousState: null,
      newState: "AVAILABLE",
      changedBy: userId,
      changeReason: "Asset assigned number and moved from holding_assets",
      timestamp: new Date(),
      details: {
        assetNumber,
        description: holdingAsset.description,
        serialNumber: holdingAsset.serialNumber,
        type,
      },
    });

    // Remove from holding_assets
    await db
      .delete(holdingAssetsTable)
      .where(eq(holdingAssetsTable.id, holdingAssetId));

    return NextResponse.json({ success: true });
  } catch {
    // Return generic server error (do not expose error details)
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
