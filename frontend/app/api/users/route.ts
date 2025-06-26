// backend/app/api/users/route.ts
// API route to fetch paginated users from the database using Drizzle ORM

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";

// GET /api/users - returns paginated users
export async function GET(request: NextRequest) {
  const start = Date.now(); // Start timing
  try {
    // Parse query params for pagination and filters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Default to 10 per page
    const offset = (page - 1) * limit;
    const department = searchParams.get("department") || "all";
    const role = searchParams.get("role") || "all";

    // Build where conditions for filters
    const whereConditions = [];
    if (department !== "all") {
      whereConditions.push(eq(usersTable.department, department));
    }
    if (role !== "all" && (role === "ADMIN" || role === "USER")) {
      whereConditions.push(eq(usersTable.role, role as "ADMIN" | "USER"));
    }

    // Only select columns needed for the frontend table
    let users;
    if (whereConditions.length > 0) {
      users = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          department: usersTable.department,
          isActive: usersTable.isActive,
          employeeId: usersTable.employeeId,
        })
        .from(usersTable)
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset);
    } else {
      users = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          department: usersTable.department,
          isActive: usersTable.isActive,
          employeeId: usersTable.employeeId,
        })
        .from(usersTable)
        .limit(limit)
        .offset(offset);
    }

    // Get total count for pagination (with filters)
    let totalCountResult;
    if (whereConditions.length > 0) {
      totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable)
        .where(and(...whereConditions));
    } else {
      totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable);
    }
    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const durationMs = Date.now() - start; // End timing
    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        totalUsers: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timingMs: durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - start;
    console.error("Error fetching users:", error, `Timing: ${durationMs}ms`);
    return NextResponse.json(
      { error: "Failed to fetch users", timingMs: durationMs },
      { status: 500 }
    );
  }
}
