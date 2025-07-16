// frontend/app/api/locations/[id]/assignments/route.ts
// API route to fetch users and assets assigned to a location

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, assetsTable } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // Await context.params as required by Next.js dynamic API routes
  const { id: locationId } = await context.params;
  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }
  // Parse pagination params
  const { searchParams } = new URL(req.url);
  const userPage = parseInt(searchParams.get("userPage") || "1");
  const assetPage = parseInt(searchParams.get("assetPage") || "1");
  const userLimit = parseInt(searchParams.get("userLimit") || "10");
  const assetLimit = parseInt(searchParams.get("assetLimit") || "10");
  const userOffset = (userPage - 1) * userLimit;
  const assetOffset = (assetPage - 1) * assetLimit;
  try {
    // Fetch total counts
    const [userCountResult] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.locationId, locationId));
    const [assetCountResult] = await db
      .select({ count: count() })
      .from(assetsTable)
      .where(eq(assetsTable.locationId, locationId));
    const userTotal = Number(userCountResult?.count || 0);
    const assetTotal = Number(assetCountResult?.count || 0);
    // Fetch paginated users
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.locationId, locationId))
      .limit(userLimit)
      .offset(userOffset);
    // Fetch paginated assets
    const assets = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.locationId, locationId))
      .limit(assetLimit)
      .offset(assetOffset);
    return NextResponse.json({
      users,
      assets,
      userTotal,
      assetTotal,
      userPage,
      assetPage,
      userLimit,
      assetLimit,
    });
  } catch (err) {
    // Log the error for debugging
    console.error("Error in /api/locations/[id]/assignments:", err);
    // Return the error message in the response (temporarily for debugging)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
