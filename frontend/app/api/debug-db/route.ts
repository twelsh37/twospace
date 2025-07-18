// frontend/app/api/debug-db/route.ts
// Debug endpoint to test database connection

import { NextResponse } from "next/server";
import { db, assetsTable } from "@/lib/db";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    console.log("=== DATABASE CONNECTION TEST ===");

    // Simple query to test connection
    const result = await db.select({ count: count() }).from(assetsTable);

    console.log("Database query successful:", result);

    return NextResponse.json({
      success: true,
      message: "Database connection working",
      assetCount: result[0]?.count || 0,
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
