// backend/app/api/departments/route.ts
// API route to return all unique department names from the departments table

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departmentsTable } from "@/lib/db/schema";

export async function GET() {
  try {
    // Query for all unique department names, ordered alphabetically
    const result = await db
      .select({ department: departmentsTable.name })
      .from(departmentsTable)
      .orderBy(departmentsTable.name);

    // Deduplicate department names
    const seen = new Set<string>();
    const departments = result
      .map((row) => row.department)
      .filter((name) => {
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
