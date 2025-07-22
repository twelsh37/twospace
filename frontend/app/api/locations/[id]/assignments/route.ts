// frontend/app/api/locations/[id]/assignments/route.ts
// API route for location assignments

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
import { usersTable, assetsTable } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params as required by Next.js 15 dynamic API routes
  const { id: locationId } = await params;
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
