// backend/app/api/users/[userId]/route.ts
// API route to fetch a single user by ID

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data: users[0] });
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
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    // Only allow updating fields that exist in the usersTable
    const allowedFields = [
      "name",
      "email",
      "role",
      "department",
      "isActive",
      "employeeId",
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key];
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
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
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
