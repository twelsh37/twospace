// frontend/app/api/users/by-employee-id/[employeeId]/route.ts
// API route for finding users by employee ID

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

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  usersTable,
  departmentsTable,
  locationsTable,
  assetsTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/users/by-employee-id/[employeeId] called");
  try {
    // Access employeeId from params (await needed in Next.js 15)
    const { employeeId } = await params;
    appLogger.info("Fetching user by employee ID", { employeeId });
    if (!employeeId) {
      appLogger.warn(
        "Employee ID is required in GET /api/users/by-employee-id/[employeeId]"
      );
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Join departments and locations to get names
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        department: departmentsTable.name,
        location: locationsTable.name,
        isActive: usersTable.isActive,
        employeeId: usersTable.employeeId,
      })
      .from(usersTable)
      .innerJoin(
        departmentsTable,
        eq(usersTable.departmentId, departmentsTable.id)
      )
      .innerJoin(locationsTable, eq(usersTable.locationId, locationsTable.id))
      .where(eq(usersTable.employeeId, employeeId));

    if (!users.length) {
      appLogger.warn(
        "User not found in GET /api/users/by-employee-id/[employeeId]",
        { employeeId }
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Fetch assets assigned to this user by employee ID
    const assets = await db
      .select({
        assetNumber: assetsTable.assetNumber,
        type: assetsTable.type,
        description: assetsTable.description,
        state: assetsTable.state,
        location: assetsTable.locationId,
      })
      .from(assetsTable)
      .where(eq(assetsTable.employeeId, employeeId));

    appLogger.info("Fetched user and assets successfully by employee ID", {
      employeeId,
    });
    return NextResponse.json({ data: user, assets });
  } catch (error) {
    systemLogger.error(
      `Error fetching user by employee ID: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
