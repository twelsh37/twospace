// frontend/app/api/search/route.ts
// API route for search functionality

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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  assetsTable,
  usersTable,
  locationsTable,
  assetHistoryTable,
  archivedAssetsTable,
} from "@/lib/db/schema";
import { ilike, or, eq, desc, sql } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireUser } from "@/lib/supabase-auth-helpers";

/**
 * GET /api/search?q={query}
 * Searches for assets, users, and locations based on the query.
 */
export async function GET(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for searching
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  // Log the start of the GET request
  appLogger.info("GET /api/search called");
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    appLogger.info("Search query received", { query });

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      appLogger.warn(
        "Query parameter is required and cannot be empty in search"
      );
      return NextResponse.json(
        { error: "Query parameter is required and cannot be empty" },
        { status: 400 }
      );
    }

    const normalizedQuery = `%${query}%`;

    // Perform searches in parallel
    const [assetResults, archivedAssetResults, userResults, locationResults] =
      await Promise.all([
        db
          .select({
            ...getTableColumns(assetsTable),
            locationName: locationsTable.name,
          })
          .from(assetsTable)
          .leftJoin(
            locationsTable,
            eq(assetsTable.locationId, locationsTable.id)
          )
          .where(ilike(assetsTable.assetNumber, normalizedQuery)),
        db
          .select({
            ...getTableColumns(archivedAssetsTable),
            locationName: sql`NULL`, // Archived assets may not have a location name
            archiveReason: archivedAssetsTable.archiveReason,
            archivedAt: archivedAssetsTable.archivedAt,
            archivedBy: archivedAssetsTable.archivedBy,
          })
          .from(archivedAssetsTable)
          .where(ilike(archivedAssetsTable.assetNumber, normalizedQuery)),
        db
          .select()
          .from(usersTable)
          .where(
            or(
              ilike(usersTable.name, normalizedQuery),
              ilike(usersTable.email, normalizedQuery)
            )
          ),
        db
          .select()
          .from(locationsTable)
          .where(ilike(locationsTable.name, normalizedQuery)),
      ]);

    // For each asset, find who updated it last
    const assetsWithHistory = await Promise.all(
      assetResults.map(async (asset) => {
        const lastHistory = await db
          .select({ updatedBy: usersTable.name })
          .from(assetHistoryTable)
          .leftJoin(usersTable, eq(assetHistoryTable.changedBy, usersTable.id))
          .where(eq(assetHistoryTable.assetId, asset.id))
          .orderBy(desc(assetHistoryTable.timestamp))
          .limit(1);

        return {
          ...asset,
          updatedByName: lastHistory[0]?.updatedBy || "System",
          isArchived: false,
        };
      })
    );

    // Add isArchived and archive metadata to archived assets
    const archivedAssetsWithMeta = archivedAssetResults.map((asset) => ({
      ...asset,
      isArchived: true,
      assignedTo: null, // Always unassigned for archived assets
      updatedByName: "Archived", // Or fetch who archived if needed
    }));

    const results = {
      assets: [...assetsWithHistory, ...archivedAssetsWithMeta],
      users: userResults,
      locations: locationResults,
    };

    appLogger.info("Search completed", {
      assetCount: results.assets.length,
      userCount: results.users.length,
      locationCount: results.locations.length,
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    systemLogger.error(
      `Error during search: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
