// backend/app/api/departments/route.ts
// API route to return all unique department names from the departments table

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departmentsTable } from "@/lib/db/schema";

export async function GET() {
  try {
    // Query for all department ids and names, ordered alphabetically
    const result = await db
      .select({ id: departmentsTable.id, name: departmentsTable.name })
      .from(departmentsTable)
      .orderBy(departmentsTable.name);

    // Deduplicate by name, but keep id
    const seen = new Set<string>();
    const departments = result.filter((row) => {
      if (!row.name || seen.has(row.name.toUpperCase())) return false;
      seen.add(row.name.toUpperCase());
      return true;
    }).map((row) => ({ ...row, name: row.name.toUpperCase() }));
    // All department names are now uppercase for consistency.

    // Return array of { id, name }
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
