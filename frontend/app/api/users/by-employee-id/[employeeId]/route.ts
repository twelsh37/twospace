// frontend/app/api/users/by-employee-id/[employeeId]/route.ts
// API route to fetch a single user by employee ID

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  usersTable,
  departmentsTable,
  locationsTable,
  assetsTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await context.params;
    if (!employeeId) {
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

    return NextResponse.json({ data: user, assets });
  } catch (error) {
    console.error("Error fetching user by employee ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
