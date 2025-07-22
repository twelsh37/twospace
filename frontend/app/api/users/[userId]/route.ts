// frontend/app/api/users/[userId]/route.ts
// API route for individual user operations

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
import { usersTable, departmentsTable, locationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Log the start of the GET request
  appLogger.info("GET /api/users/[userId] called");
  try {
    // Access userId from params (await needed in Next.js 15)
    const { userId } = await params;
    appLogger.info("Fetching user by ID", { userId });
    if (!userId) {
      appLogger.warn("User ID is required in GET /api/users/[userId]");
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
      appLogger.warn("User not found in GET /api/users/[userId]", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = users[0];
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    systemLogger.error(
      `Error fetching user: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Log the start of the PATCH request
  appLogger.info("PATCH /api/users/[userId] called");
  try {
    const { userId } = await params;
    appLogger.info("Updating user by ID", { userId });
    if (!userId) {
      appLogger.warn("User ID is required in PATCH /api/users/[userId]");
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
      appLogger.warn("No valid fields to update in PATCH /api/users/[userId]", {
        userId,
      });
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
      appLogger.warn("User not found in PATCH /api/users/[userId]", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    appLogger.info("User updated successfully", { userId });
    return NextResponse.json({ data: updated[0] });
  } catch (error) {
    systemLogger.error(
      `Error updating user: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Log the start of the DELETE request
  appLogger.info("DELETE /api/users/[userId] called");
  try {
    const { userId } = await params;
    appLogger.info("Deleting user by ID", { userId });
    if (!userId) {
      appLogger.warn("User ID is required in DELETE /api/users/[userId]");
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
      appLogger.warn("User not found in DELETE /api/users/[userId]", {
        userId,
      });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    appLogger.info("User deleted successfully", { userId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    systemLogger.error(
      `Error deleting user: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
