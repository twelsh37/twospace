// backend/app/api/locations/route.ts
// API route for fetching locations

import { NextResponse } from "next/server";
import { db, locationsTable } from "@/lib/db";
import { eq, ilike, and } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Define standard CORS headers for reusability
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: Request) {
  // Log the start of the GET request
  appLogger.info("GET /api/locations called");
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const isActive = searchParams.get("isActive");
    const locationId = searchParams.get("locationId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    // Log filters being used
    appLogger.info("GET /api/locations - Filters:", {
      name,
      isActive,
      locationId,
      page,
      limit,
    });
    const offset = (page - 1) * limit;

    const conditions = [];
    // Only add isActive filter if not 'ALL'
    if (isActive && isActive.toUpperCase() !== "ALL") {
      if (isActive === "true") {
        conditions.push(eq(locationsTable.isActive, true));
      } else if (isActive === "false") {
        conditions.push(eq(locationsTable.isActive, false));
      }
    }
    // Only add locationId filter if not 'ALL'
    if (locationId && locationId.toUpperCase() !== "ALL") {
      conditions.push(eq(locationsTable.id, locationId));
    } else if (name) {
      conditions.push(ilike(locationsTable.name, `%${name}%`));
    }

    // Get total count for pagination
    let totalCount = 0;
    if (conditions.length > 0) {
      totalCount = (
        await db
          .select()
          .from(locationsTable)
          .where(and(...conditions))
      ).length;
    } else {
      totalCount = (await db.select().from(locationsTable)).length;
    }
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Get paginated locations
    let locations;
    if (conditions.length > 0) {
      locations = await db
        .select()
        .from(locationsTable)
        .where(and(...conditions))
        .orderBy(locationsTable.name)
        .limit(limit)
        .offset(offset);
    } else {
      locations = await db
        .select()
        .from(locationsTable)
        .orderBy(locationsTable.name)
        .limit(limit)
        .offset(offset);
    }

    // When returning locations, ensure all names are uppercase for consistency.
    const locationsUpper = locations.map((loc) => ({
      ...loc,
      name: loc.name.toUpperCase(),
    }));
    appLogger.info(`Fetched ${locationsUpper.length} locations successfully`);
    return NextResponse.json(
      {
        success: true,
        data: locationsUpper,
        pagination: {
          page,
          limit,
          totalLocations: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    systemLogger.error(
      `Error fetching locations: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch locations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Add an OPTIONS handler for preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// Add POST handler for creating a new location
export async function POST(req: Request) {
  // Log the start of the POST request
  appLogger.info("POST /api/locations called");
  try {
    const body = await req.json();
    const { name, description, isActive } = body;
    appLogger.info("Creating new location", { name, description, isActive });

    // Validate required fields
    if (!name || typeof name !== "string") {
      appLogger.warn(
        "Name is required and must be a string in POST /api/locations"
      );
      return NextResponse.json(
        { success: false, error: "Name is required and must be a string." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check for duplicate name
    const existing = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.name, name));
    if (existing.length > 0) {
      appLogger.warn("Location name must be unique in POST /api/locations", {
        name,
      });
      return NextResponse.json(
        { success: false, error: "Location name must be unique." },
        { status: 409, headers: corsHeaders }
      );
    }

    // Insert new location, always store name as uppercase for consistency.
    const [newLocation] = await db
      .insert(locationsTable)
      .values({
        name: name.toUpperCase(),
        description: description || null,
        isActive: isActive !== undefined ? !!isActive : true,
      })
      .returning();

    appLogger.info("Location created successfully", { name: newLocation.name });
    return NextResponse.json(
      { success: true, data: newLocation },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    systemLogger.error(
      `Error creating location: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create location",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
