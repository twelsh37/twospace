// backend/app/api/dashboard/route.ts
// API route to fetch aggregated data for the main dashboard.

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/db/dashboard";

/**
 * GET /api/dashboard
 * Retrieves all the necessary statistics for the dashboard in a single request.
 */
export async function GET() {
  try {
    const dashboardData = await getDashboardData();
    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
