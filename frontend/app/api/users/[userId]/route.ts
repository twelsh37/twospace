// backend/app/api/users/[userId]/route.ts
// API route to fetch a single user by ID

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
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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
      .where(eq(usersTable.id, userId));
    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = users[0];
    // Fetch assets assigned to this user by email
    const assets = await db
      .select({
        assetNumber: assetsTable.assetNumber,
        type: assetsTable.type,
        description: assetsTable.description,
        state: assetsTable.state,
        location: assetsTable.locationId,
      })
      .from(assetsTable)
      .where(eq(assetsTable.assignedTo, user.email));
    return NextResponse.json({ data: user, assets });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    // Only allow updating fields that exist in the usersTable
    const allowedFields = [
      "name",
      "email",
      "role",
      "department",
      "isActive",
      "employeeId",
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    const updated = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning();
    if (!updated.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data: updated[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const deleted = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning();
    if (!deleted.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
