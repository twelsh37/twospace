// frontend/app/api/holding-assets/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { holdingAssetsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET() {
  // Log the start of the GET request
  appLogger.info("GET /api/holding-assets called");
  try {
    const assets = await db.select().from(holdingAssetsTable);
    appLogger.info(`Fetched ${assets.length} holding assets successfully`);
    return NextResponse.json({ data: { assets } });
  } catch (error) {
    systemLogger.error(
      `Error fetching holding assets: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch holding assets." },
      { status: 500 }
    );
  }
}
