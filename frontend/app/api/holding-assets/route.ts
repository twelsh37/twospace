// frontend/app/api/holding-assets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { holdingAssetsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireAuth } from "@/lib/supabase-auth-helpers";

export async function GET(req: NextRequest) {
  // Log the start of the GET request
  appLogger.info("GET /api/holding-assets called");

  try {
    // Require authentication
    const user = await requireAuth(req);
    if (user instanceof NextResponse) return user; // Not authenticated

    appLogger.info(`Fetching holding assets for user: ${user.email}`);

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
