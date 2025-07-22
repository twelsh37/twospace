// frontend/app/api/locations/[id]/route.ts
// API route for individual location operations

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
import { db, locationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/locations/[id] called");
  try {
    // Access id from params (await needed in Next.js 15)
    const { id } = await params;
    appLogger.info("Fetching location by ID", { id });
    const location = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.id, id));
    if (!location.length) {
      appLogger.warn("Location not found in GET /api/locations/[id]", { id });
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    appLogger.info("Fetched location successfully", { id });
    return NextResponse.json(
      { success: true, data: location[0] },
      { headers: corsHeaders }
    );
  } catch (error) {
    systemLogger.error(
      `Error fetching location: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch location",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Log the start of the PUT request
  appLogger.info("PUT /api/locations/[id] called");
  try {
    const { id } = await params;
    appLogger.info("Updating location by ID", { id });
    const body = await req.json();
    const { name, description, isActive } = body;
    // Validate required fields
    if (!name || typeof name !== "string") {
      appLogger.warn(
        "Name is required and must be a string in PUT /api/locations/[id]",
        { id }
      );
      return NextResponse.json(
        { success: false, error: "Name is required and must be a string." },
        { status: 400, headers: corsHeaders }
      );
    }
    // Check for duplicate name (excluding self)
    const existing = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.name, name));
    if (existing.length && existing[0].id !== id) {
      appLogger.warn(
        "Location name must be unique in PUT /api/locations/[id]",
        { id, name }
      );
      return NextResponse.json(
        { success: false, error: "Location name must be unique." },
        { status: 409, headers: corsHeaders }
      );
    }
    // Update location
    const [updated] = await db
      .update(locationsTable)
      .set({
        name,
        description: description || null,
        isActive: isActive !== undefined ? !!isActive : true,
      })
      .where(eq(locationsTable.id, id))
      .returning();
    if (!updated) {
      appLogger.warn(
        "Location not found or not updated in PUT /api/locations/[id]",
        { id }
      );
      return NextResponse.json(
        { success: false, error: "Location not found or not updated" },
        { status: 404, headers: corsHeaders }
      );
    }
    appLogger.info("Location updated successfully", { id });
    return NextResponse.json(
      { success: true, data: updated },
      { headers: corsHeaders }
    );
  } catch (error) {
    systemLogger.error(
      `Error updating location: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update location",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Log the start of the DELETE request
  appLogger.info("DELETE /api/locations/[id] called");
  try {
    const { id } = await params;
    appLogger.info("Deleting location by ID (soft delete)", { id });
    // Soft delete: set isActive to false
    const [deleted] = await db
      .update(locationsTable)
      .set({ isActive: false })
      .where(eq(locationsTable.id, id))
      .returning();
    if (!deleted) {
      appLogger.warn(
        "Location not found or not deleted in DELETE /api/locations/[id]",
        { id }
      );
      return NextResponse.json(
        { success: false, error: "Location not found or not deleted" },
        { status: 404, headers: corsHeaders }
      );
    }
    appLogger.info("Location deleted (soft) successfully", { id });
    return NextResponse.json(
      { success: true, data: deleted },
      { headers: corsHeaders }
    );
  } catch (error) {
    systemLogger.error(
      `Error deleting location: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete location",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}
