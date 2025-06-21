// backend/app/api/search/route.ts
// API route for global search across assets, users, and locations.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  assetsTable,
  usersTable,
  locationsTable,
  assetHistoryTable,
} from "@/lib/db/schema";
import { ilike, or, eq, desc } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";

/**
 * GET /api/search?q={query}
 * Searches for assets, users, and locations based on the query.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter is required and cannot be empty" },
        { status: 400 }
      );
    }

    const normalizedQuery = `%${query}%`;

    // Perform searches in parallel
    const [assetResults, userResults, locationResults] = await Promise.all([
      db
        .select({
          ...getTableColumns(assetsTable),
          locationName: locationsTable.name,
        })
        .from(assetsTable)
        .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id))
        .where(ilike(assetsTable.assetNumber, normalizedQuery)),
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
          .where(eq(assetHistoryTable.assetId, asset.assetNumber))
          .orderBy(desc(assetHistoryTable.timestamp))
          .limit(1);

        return {
          ...asset,
          updatedByName: lastHistory[0]?.updatedBy || "System",
        };
      })
    );

    const results = {
      assets: assetsWithHistory,
      users: userResults,
      locations: locationResults,
    };

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error during search:", error);
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
