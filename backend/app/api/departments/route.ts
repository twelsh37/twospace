// backend/app/api/departments/route.ts
// API route to return all unique department names from the users table

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Query for unique department names
    const result = await db
      .select({ department: usersTable.department })
      .from(usersTable)
      .groupBy(usersTable.department)
      .orderBy(usersTable.department);
    const departments = result.map((row) => row.department).filter(Boolean);
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
