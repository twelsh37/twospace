// backend/app/api/dashboard/route.ts
// API route to fetch aggregated data for the main dashboard.

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
import { getDashboardData } from "@/lib/db/dashboard";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireUser } from "@/lib/supabase-auth-helpers";

/**
 * GET /api/dashboard
 * Retrieves all the necessary statistics for the dashboard in a single request.
 */
export async function GET(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for viewing dashboard
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401 }
    );
  }

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
