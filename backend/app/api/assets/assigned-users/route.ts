// backend/app/api/assets/assigned-users/route.ts
// API route for fetching unique assigned users

import { NextResponse } from "next/server";
import { db, assetsTable } from "@/lib/db";
import { isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Define standard CORS headers for reusability
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  try {
    const assignedUsers = await db
      .select({
        assignedTo: assetsTable.assignedTo,
      })
      .from(assetsTable)
      .where(isNotNull(assetsTable.assignedTo))
      .groupBy(assetsTable.assignedTo)
      .orderBy(assetsTable.assignedTo);

    const users = assignedUsers
      .map((u) => u.assignedTo)
      .filter(Boolean) as string[];

    return NextResponse.json(
      { success: true, data: users },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assigned users",
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
