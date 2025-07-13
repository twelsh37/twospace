// backend/app/api/dashboard/route.ts
// API route to fetch aggregated data for the main dashboard.

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/db/dashboard";
import { systemLogger, appLogger } from "@/lib/logger";

/**
 * GET /api/dashboard
 * Retrieves all the necessary statistics for the dashboard in a single request.
 */
export async function GET() {
  // TEST: Write a test log entry to verify logging works
  appLogger.info("TEST LOG: /api/dashboard GET handler invoked");
  // Log the start of the dashboard data request
  appLogger.info("GET /api/dashboard called");
  try {
    const dashboardData = await getDashboardData();
    appLogger.info("Dashboard data fetched successfully");
    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    systemLogger.error(
      `Error fetching dashboard data: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
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
