// backend/app/api/locations/[id]/route.ts
// API route for single location CRUD operations

import { NextResponse } from "next/server";
import { db, locationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const location = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.id, id));
    if (!location.length) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { success: true, data: location[0] },
      { headers: corsHeaders }
    );
  } catch (error) {
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, description, isActive } = body;
    // Validate required fields
    if (!name || typeof name !== "string") {
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
      return NextResponse.json(
        { success: false, error: "Location not found or not updated" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { success: true, data: updated },
      { headers: corsHeaders }
    );
  } catch (error) {
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Soft delete: set isActive to false
    const [deleted] = await db
      .update(locationsTable)
      .set({ isActive: false })
      .where(eq(locationsTable.id, id))
      .returning();
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Location not found or not deleted" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { success: true, data: deleted },
      { headers: corsHeaders }
    );
  } catch (error) {
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
