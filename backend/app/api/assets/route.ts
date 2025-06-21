// backend/app/api/assets/route.ts
// Asset Management API Routes with Drizzle ORM

import { NextRequest, NextResponse } from "next/server";
import { eq, and, or, ilike, desc, asc, sql, isNull } from "drizzle-orm";
import { db, assetsTable, locationsTable, assetHistoryTable } from "@/lib/db";
import {
  generateAssetNumber,
  createAssetHistory,
  getActiveAssets,
} from "@/lib/db/utils";
import type { NewAsset } from "@/lib/db/schema";

/**
 * GET /api/assets
 * Retrieve assets with optional filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const type = searchParams.get("type") || "all";
    const state = searchParams.get("state") || "all";
    const locationId = searchParams.get("locationId") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("GET /api/assets - Filters:", {
      type,
      state,
      locationId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [isNull(assetsTable.deletedAt)];

    if (type !== "all") {
      whereConditions.push(eq(assetsTable.type, type as any));
    }

    if (state !== "all") {
      whereConditions.push(eq(assetsTable.state, state as any));
    }

    if (locationId !== "all") {
      whereConditions.push(eq(assetsTable.locationId, locationId));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(assetsTable.assetNumber, `%${search}%`),
          ilike(assetsTable.serialNumber, `%${search}%`),
          ilike(assetsTable.description, `%${search}%`),
          ilike(assetsTable.assignedTo, `%${search}%`)
        )
      );
    }

    // Get total count for pagination
    let totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(assetsTable);

    if (whereConditions.length > 0) {
      totalCountQuery = totalCountQuery.where(and(...whereConditions));
    }

    const totalCountResult = await totalCountQuery;

    const totalAssets = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalAssets / limit);

    // Get assets with location details
    let assetsQuery = db
      .select({
        asset: assetsTable,
        location: locationsTable,
      })
      .from(assetsTable)
      .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id));

    if (whereConditions.length > 0) {
      assetsQuery = assetsQuery.where(and(...whereConditions));
    }

    const assetsWithLocations = await assetsQuery
      .orderBy(
        sortOrder === "desc"
          ? desc(assetsTable.createdAt)
          : asc(assetsTable.createdAt)
      )
      .limit(limit)
      .offset(offset);

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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
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
    } = body;

    // Basic validation
    if (
      !type ||
      !serialNumber ||
      !description ||
      !purchasePrice ||
      !locationId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details:
            "type, serialNumber, description, purchasePrice, and locationId are required",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    // Check if serial number is unique
    const existingAsset = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.serialNumber, serialNumber))
      .limit(1);

    if (existingAsset.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Serial number already exists",
          details: "An asset with this serial number already exists",
        },
        { status: 400 }
      );
    }

    // Generate asset number
    const assetNumber = await generateAssetNumber(type as any);

    // Create new asset
    const newAssetData: NewAsset = {
      assetNumber,
      type: type as any,
      state: "AVAILABLE", // New assets start as AVAILABLE
      serialNumber,
      description,
      purchasePrice: parseFloat(purchasePrice).toString(),
      locationId,
      assignmentType: assignmentType as any,
      assignedTo: assignmentType === "INDIVIDUAL" ? assignedTo : null,
      employeeId: assignmentType === "INDIVIDUAL" ? employeeId : null,
      department: assignmentType === "INDIVIDUAL" ? department : null,
    };

    const [newAsset] = await db
      .insert(assetsTable)
      .values(newAssetData)
      .returning();

    // Create initial history entry
    await createAssetHistory(
      newAsset.assetNumber,
      "AVAILABLE",
      "system", // TODO: Replace with actual user ID from authentication
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create asset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assets
 * Bulk update assets (e.g., state transitions, bulk operations)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("PUT /api/assets - Request body:", body);

    const {
      assetIds,
      operation,
      newState,
      updateData,
      reason = "Bulk operation",
    } = body;

    // Basic validation
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid assetIds",
          details: "assetIds must be a non-empty array",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    let updatedAssets: any[] = [];

    if (operation === "stateTransition" && newState) {
      // Get current assets to track previous states
      const currentAssets = await db
        .select()
        .from(assetsTable)
        .where(
          and(
            sql`${assetsTable.id} = ANY(${assetIds})`,
            isNull(assetsTable.deletedAt)
          )
        );

      // Update assets with new state
      updatedAssets = await db
        .update(assetsTable)
        .set({
          state: newState as any,
          updatedAt: new Date(),
        })
        .where(sql`${assetsTable.id} = ANY(${assetIds})`)
        .returning();

      // Create history entries for each asset
      for (const asset of currentAssets) {
        await createAssetHistory(
          asset.id,
          newState,
          "system", // TODO: Replace with actual user ID from authentication
          reason,
          asset.state,
          { operation: "bulk_state_transition" }
        );
      }

      console.log(
        `Updated ${updatedAssets.length} assets to state: ${newState}`
      );
    } else if (operation === "bulkUpdate" && updateData) {
      // Handle bulk field updates
      updatedAssets = await db
        .update(assetsTable)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(sql`${assetsTable.id} = ANY(${assetIds})`)
        .returning();

      // Create history entries
      for (const assetId of assetIds) {
        await createAssetHistory(
          assetId,
          "UPDATED",
          "system", // TODO: Replace with actual user ID from authentication
          reason,
          undefined,
          { operation: "bulk_update", updateData }
        );
      }

      console.log(`Bulk updated ${updatedAssets.length} assets`);
    }

    const response = {
      success: true,
      data: {
        updatedAssets,
        message: `Successfully completed ${operation} for ${updatedAssets.length} assets`,
        operation,
        affectedCount: updatedAssets.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error bulk updating assets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to bulk update assets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
