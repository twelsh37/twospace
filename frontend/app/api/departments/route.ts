// frontend/app/api/departments/route.ts
// API route for department management

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
import { db } from "@/lib/db";
import { departmentsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireUser } from "@/lib/supabase-auth-helpers";

export async function GET(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for viewing departments
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  // Log the start of the GET request
  appLogger.info("GET /api/departments called");
  try {
    // Query for all department ids and names, ordered alphabetically
    const result = await db
      .select({ id: departmentsTable.id, name: departmentsTable.name })
      .from(departmentsTable)
      .orderBy(departmentsTable.name);

    // Deduplicate by name, but keep id
    const seen = new Set<string>();
    const departments = result
      .filter((row) => {
        if (!row.name || seen.has(row.name.toUpperCase())) return false;
        seen.add(row.name.toUpperCase());
        return true;
      })
      .map((row) => ({ ...row, name: row.name.toUpperCase() }));
    // All department names are now uppercase for consistency.

    appLogger.info(`Fetched ${departments.length} unique departments`);
    // Return array of { id, name }
    return NextResponse.json({ departments });
  } catch (error) {
    systemLogger.error(
      `Error fetching departments: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
