// backend/app/api/locations/route.ts
// API route for fetching locations

import { NextResponse } from "next/server";
import { db, locationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Define standard CORS headers for reusability
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  try {
    const locations = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.isActive, true))
      .orderBy(locationsTable.name);

    return NextResponse.json(
      { success: true, data: locations },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
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
