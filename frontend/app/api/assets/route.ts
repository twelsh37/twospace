// backend/app/api/assets/route.ts
// Asset Management API Routes with Drizzle ORM

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
import {
  eq,
  and,
  or,
  ilike,
  desc,
  asc,
  sql,
  isNull,
  inArray,
  isNotNull,
} from "drizzle-orm";
import { db, assetsTable, locationsTable } from "@/lib/db";
import { createAssetHistory, generateAssetNumber } from "@/lib/db/utils";
import type { NewAsset } from "@/lib/db/schema";
import { settingsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireAdmin, requireUser } from "@/lib/supabase-auth-helpers";
import { usersTable } from "@/lib/db/schema";

// Define standard CORS headers for reusability
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or lock this down to your frontend's domain in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// In-memory cache for asset GET requests, keyed by query string
const assetCache: Map<
  string,
  { data: unknown; timestamp: number; duration: number }
> = new Map();

// Helper to get cache duration from settings (fetch from DB)
async function getCacheDurationFromSettings(): Promise<number> {
  try {
    const settings = await db.select().from(settingsTable).limit(1);
    if (settings.length && settings[0].reportCacheDuration) {
      return settings[0].reportCacheDuration * 60 * 1000; // convert minutes to ms
    }
  } catch {
    // Fallback to default if error
  }
  return 30 * 60 * 1000; // 30 minutes default
}

// Helper to get database user ID from Supabase Auth user
async function getDatabaseUserId(supabaseUser: {
  email?: string;
}): Promise<string> {
  console.log("getDatabaseUserId called with email:", supabaseUser.email);
  if (!supabaseUser.email) {
    console.log("No email provided");
    throw new Error("User email not found");
  }

  console.log("Looking up user in database by email:", supabaseUser.email);
  const dbUser = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, supabaseUser.email))
    .limit(1);

  console.log("Database query result:", dbUser);
  if (dbUser.length === 0) {
    console.log("No user found in database");
    throw new Error("User not found in database");
  }
  console.log("User found in database with ID:", dbUser[0].id);
  return dbUser[0].id;
}

/**
 * GET /api/assets
 * Retrieve assets with optional filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for viewing assets
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401, headers: corsHeaders }
    );
  }

  // Log the start of the GET request
  appLogger.info(`GET /api/assets called. URL: ${request.url}`);
  // Support /api/assets/next-asset-number?type=TYPE
  const { pathname, searchParams } = new URL(request.url);
  if (pathname.endsWith("/next-asset-number")) {
    const type = searchParams.get("type");
    if (!type) {
      appLogger.warn("Missing 'type' parameter for next-asset-number endpoint");
      return NextResponse.json(
        { success: false, error: "Missing type" },
        { status: 400, headers: corsHeaders }
      );
    }
    try {
      // Use the existing generateAssetNumber utility
      const assetNumber = await generateAssetNumber(
        type as "MOBILE_PHONE" | "TABLET" | "DESKTOP" | "LAPTOP" | "MONITOR"
      );
      appLogger.info(`Generated asset number for type ${type}: ${assetNumber}`);
      return NextResponse.json(
        { success: true, assetNumber },
        { headers: corsHeaders }
      );
    } catch (err) {
      systemLogger.error(
        `Failed to generate asset number for type ${type}: ${
          err instanceof Error ? err.stack : String(err)
        }`
      );
      return NextResponse.json(
        { success: false, error: "Failed to generate asset number" },
        { status: 500, headers: corsHeaders }
      );
    }
  }
  const start = Date.now(); // Start timing
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = request.url.split("?")[1] || "__no_query__";
    // Get cache duration from settings if available
    const cacheDuration = await getCacheDurationFromSettings();
    const now = Date.now();
    const cached = assetCache.get(cacheKey);
    if (cached && now - cached.timestamp < cacheDuration) {
      appLogger.info(`Cache hit for GET /api/assets with key: ${cacheKey}`);
      // Return cached data
      return NextResponse.json(cached.data, { headers: corsHeaders });
    }

    // Extract query parameters
    const type = searchParams.get("type") || "all";
    const state = searchParams.get("state") || "all";
    const locationId = searchParams.get("locationId") || "all";
    const assignedTo = searchParams.get("assignedTo") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "all";

    appLogger.info("GET /api/assets - Filters:", {
      type,
      state,
      locationId,
      assignedTo,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      status,
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [isNull(assetsTable.deletedAt)];

    // Only add type filter if not 'ALL'
    if (type && type.toUpperCase() !== "ALL") {
      whereConditions.push(
        eq(
          assetsTable.type,
          type as (typeof assetsTable.type.enumValues)[number]
        )
      );
    }

    // Only add state filter if not 'ALL'
    if (state && state.toUpperCase() !== "ALL") {
      whereConditions.push(
        eq(
          assetsTable.state,
          state as (typeof assetsTable.state.enumValues)[number]
        )
      );
    }

    // Only add status filter if not 'ALL'
    if (status && status.toUpperCase() !== "ALL") {
      whereConditions.push(
        eq(
          assetsTable.status,
          status as (typeof assetsTable.status.enumValues)[number]
        )
      );
    }

    if (locationId !== "all") {
      whereConditions.push(eq(assetsTable.locationId, locationId));
    }

    if (assignedTo !== "all") {
      if (assignedTo === "unassigned") {
        whereConditions.push(isNull(assetsTable.assignedTo));
      } else {
        whereConditions.push(eq(assetsTable.assignedTo, assignedTo));
      }
    }

    if (search) {
      const searchConditions = [
        ilike(assetsTable.assetNumber, `%${search}%`),
        ilike(assetsTable.serialNumber, `%${search}%`),
        ilike(assetsTable.description, `%${search}%`),
      ];

      const assignedToSearch = and(
        isNotNull(assetsTable.assignedTo),
        ilike(assetsTable.assignedTo, `%${search}%`)
      );
      if (assignedToSearch) {
        searchConditions.push(assignedToSearch);
      }

      whereConditions.push(or(...searchConditions)!);
    }

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(assetsTable)
      .where(and(...whereConditions));

    const totalCountResult = await totalCountQuery;

    const totalAssets = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalAssets / limit);

    // Get assets with location details
    const assetsQuery = db
      .select({
        asset: assetsTable,
        location: locationsTable,
      })
      .from(assetsTable)
      .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id))
      .where(and(...whereConditions));

    const assetsWithLocations = await assetsQuery
      .orderBy(
        sortOrder === "desc"
          ? desc(assetsTable.createdAt)
          : asc(assetsTable.createdAt)
      )
      .limit(limit)
      .offset(offset);

    const durationMs = Date.now() - start; // End timing

    const response = {
      success: true,
      data: {
        assets: assetsWithLocations.map(({ asset, location }) => ({
          ...asset,
          location: location?.name || "Unknown Location",
        })),
        pagination: {
          page,
          limit,
          totalAssets,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      timingMs: durationMs, // Add timing info
    };

    assetCache.set(cacheKey, {
      data: response,
      timestamp: now,
      duration: cacheDuration,
    });
    return NextResponse.json(response, { headers: corsHeaders });
  } catch (err) {
    systemLogger.error(
      `Error in GET /api/assets: ${
        err instanceof Error ? err.stack : String(err)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assets",
        details: err instanceof Error ? err.message : "Unknown error",
        timingMs: Date.now() - start, // Add timing info
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
  // Require ADMIN for creating assets
  const authResult = await requireAdmin(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authorized" },
      { status: 401, headers: corsHeaders }
    );
  }
  const user = authResult.data.user;
  try {
    const body = await request.json();

    console.log("POST /api/assets - Request body:", body);

    const {
      type,
      serialNumber,
      description,
      purchasePrice,
      locationId,
      assignmentType = "INDIVIDUAL",
      assignedTo,
      employeeId,
      department,
      assetNumber, // Accept assetNumber from user
    } = body;

    // Basic validation
    if (
      !type ||
      !serialNumber ||
      !description ||
      !purchasePrice ||
      !locationId ||
      !assetNumber // Require assetNumber from user
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details:
            "type, serialNumber, description, purchasePrice, locationId, and assetNumber are required",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate asset number length (max 10 characters)
    if (assetNumber.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset number too long",
          details: "Asset number must be 10 characters or less",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate location exists
    const location = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.id, locationId))
      .limit(1);

    if (location.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid location",
          details: "The specified location does not exist",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if asset number is unique
    const existingAssetNumber = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.assetNumber, assetNumber))
      .limit(1);
    if (existingAssetNumber.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset number already exists",
          details: "An asset with this asset number already exists",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create new asset (assetNumber is now provided by user)
    const newAssetData: NewAsset = {
      assetNumber,
      type: type as
        | "MOBILE_PHONE"
        | "TABLET"
        | "DESKTOP"
        | "LAPTOP"
        | "MONITOR",
      state: "AVAILABLE", // New assets start as AVAILABLE
      serialNumber,
      description,
      purchasePrice: parseFloat(purchasePrice).toString(), // Convert to string for type compatibility
      locationId,
      assignmentType: assignmentType as "INDIVIDUAL" | "SHARED",
      assignedTo: assignmentType === "INDIVIDUAL" ? assignedTo : null,
      employeeId: assignmentType === "INDIVIDUAL" ? employeeId : null,
      department: assignmentType === "INDIVIDUAL" ? department : null,
    };

    console.log("=== ASSET CREATION DEBUG ===");
    console.log("New asset data:", newAssetData);
    console.log("Purchase price type:", typeof newAssetData.purchasePrice);
    console.log("Purchase price value:", newAssetData.purchasePrice);

    const [newAsset] = await db
      .insert(assetsTable)
      .values(newAssetData)
      .returning();

    // Get the database user ID for asset history
    const dbUserId = await getDatabaseUserId(user);

    // Use the database user's ID for asset history
    await createAssetHistory(
      newAsset.id,
      "AVAILABLE",
      dbUserId, // Use the database user ID, not the Supabase Auth user ID
      "Asset created",
      undefined,
      { createdFrom: "api" }
    );

    const response = {
      success: true,
      data: {
        asset: newAsset,
        message: "Asset created successfully",
      },
    };

    return NextResponse.json(response, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create asset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/assets
 * Bulk update assets (e.g., state transitions, bulk operations)
 */
export async function PUT(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for asset operations
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authorized" },
      { status: 401, headers: corsHeaders }
    );
  }
  const user = authResult.data.user;
  try {
    const body = await request.json();

    console.log("PUT /api/assets - Request body:", body);

    const {
      assetIds,
      operation,
      payload: { newState, userId, ...updateData } = {},
    } = body;

    // Validate input
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: "assetIds must be a non-empty array",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!operation) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing operation",
          details:
            'operation is required (e.g., "stateTransition", "bulkUpdate")',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Require userId for state transitions (audit trail)
    if (operation === "stateTransition" && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing userId",
          details: "userId is required for state transitions",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch assets to ensure they exist
    const assetsToUpdate = await db
      .select()
      .from(assetsTable)
      .where(inArray(assetsTable.assetNumber, assetIds));

    if (assetsToUpdate.length !== assetIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assetIds",
          details: "Some assets do not exist",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Process the operation
    switch (operation) {
      case "stateTransition":
        console.log("=== STATE TRANSITION START ===");
        if (!newState) {
          console.log("Missing newState");
          return NextResponse.json(
            {
              success: false,
              error: "Missing newState",
              details: "newState is required for stateTransition operation",
            },
            { status: 400, headers: corsHeaders }
          );
        }

        console.log("Getting database user ID for user:", user.email);
        // Get the database user ID for the audit trail
        let dbUserId: string;
        try {
          dbUserId = await getDatabaseUserId(user);
          console.log("Database user ID found:", dbUserId);
        } catch (error) {
          console.error("Error finding user in database:", error);
          return NextResponse.json(
            {
              success: false,
              error: "User not found in database",
              details:
                "User must exist in the users table to perform state transitions",
            },
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(
          "Creating asset history for",
          assetsToUpdate.length,
          "assets"
        );
        for (const asset of assetsToUpdate) {
          console.log(
            "Creating history for asset:",
            asset.assetNumber,
            "new state:",
            newState
          );
          await createAssetHistory(
            asset.id,
            newState,
            dbUserId, // Use the database user ID, not the Supabase Auth user ID
            "Bulk state transition",
            asset.state as "AVAILABLE" | "ISSUED"
          );
          console.log("History created for asset:", asset.assetNumber);
        }

        console.log("Updating asset states in database");
        await db
          .update(assetsTable)
          .set({ state: newState, updatedAt: new Date() })
          .where(inArray(assetsTable.assetNumber, assetIds));
        console.log("Asset states updated");

        // Clear in-memory asset cache to ensure fresh data
        assetCache.clear();
        console.log("Cache cleared");
        console.log("=== STATE TRANSITION COMPLETE ===");
        break;

      case "bulkUpdate":
        if (updateData) {
          // For simplicity, only location is updatable for now. Extend as needed.
          if (updateData.locationId) {
            await db
              .update(assetsTable)
              .set({ locationId: updateData.locationId, updatedAt: new Date() })
              .where(inArray(assetsTable.assetNumber, assetIds));
          }
        }
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid operation",
            details: "Invalid operation",
          },
          { status: 400, headers: corsHeaders }
        );
    }

    const response = {
      success: true,
      data: {
        updatedAssets: assetsToUpdate,
        message: `Successfully completed ${operation} for ${assetsToUpdate.length} assets`,
        operation,
        affectedCount: assetsToUpdate.length,
      },
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error("Error bulk updating assets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to bulk update assets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
