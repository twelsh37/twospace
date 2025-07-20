// frontend/app/api/debug-users/route.ts
// Debug endpoint to list users in the database

import { NextResponse } from "next/server";
import { db, usersTable } from "@/lib/db";

export async function GET() {
  try {
    // Get all users from the database
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        employeeId: usersTable.employeeId,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .limit(10); // Limit to first 10 users

    console.log("Found users:", users);

    return NextResponse.json({
      success: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Debug users endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
