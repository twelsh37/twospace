// backend/app/api/users/route.ts
// API route to fetch paginated users from Drizzle ORM (not Supabase)

import { NextRequest, NextResponse } from "next/server";
import { db, usersTable, departmentsTable, locationsTable } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireAuth, requireAdmin } from "@/lib/supabase-auth-helpers";

// GET /api/users - returns paginated users
export async function GET(request: NextRequest) {
  // Require authentication for listing users (both ADMIN and USER roles allowed)
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user; // Not authenticated
  appLogger.info(`GET /api/users called. URL: ${request.url}`);
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const department = searchParams.get("department") || "ALL";
    const role = searchParams.get("role") || "ALL";
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (department && department.toUpperCase() !== "ALL") {
      conditions.push(eq(usersTable.departmentId, department));
    }
    // Only filter by role if a specific role is requested
    if (role && role.toUpperCase() !== "ALL") {
      const roleValue = role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
      conditions.push(eq(usersTable.role, roleValue));
    }

    // Get total count for pagination (use SQL COUNT for performance)
    let totalCount = 0;
    if (conditions.length > 0) {
      const [{ value }] = await db
        .select({ value: count() })
        .from(usersTable)
        .where(and(...conditions));
      totalCount = Number(value) || 0;
    } else {
      const [{ value }] = await db.select({ value: count() }).from(usersTable);
      totalCount = Number(value) || 0;
    }
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Get paginated users, join departments and locations for names
    let users;
    if (conditions.length > 0) {
      users = await db
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
        .leftJoin(
          departmentsTable,
          eq(usersTable.departmentId, departmentsTable.id)
        )
        .leftJoin(locationsTable, eq(usersTable.locationId, locationsTable.id))
        .where(and(...conditions))
        .orderBy(usersTable.name)
        .limit(limit)
        .offset(offset);
    } else {
      users = await db
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
        .leftJoin(
          departmentsTable,
          eq(usersTable.departmentId, departmentsTable.id)
        )
        .leftJoin(locationsTable, eq(usersTable.locationId, locationsTable.id))
        .orderBy(usersTable.name)
        .limit(limit)
        .offset(offset);
    }

    appLogger.info(`Fetched ${users.length} users successfully`);
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
      responseTime: Date.now() - start,
    });
  } catch (error) {
    systemLogger.error(
      `Error fetching users: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - create a new user
export async function POST(request: NextRequest) {
  // Require ADMIN for creating users
  const user = await requireAdmin(request);
  if (user instanceof NextResponse) return user; // Not authorized
  appLogger.info("POST /api/users called");
  try {
    const body = await request.json();
    const {
      name,
      email,
      departmentId,
      locationId,
      role,
      isActive,
      employeeId,
    } = body;

    appLogger.info("Attempting to create user", {
      name,
      email,
      departmentId,
      locationId,
      role,
      isActive,
      employeeId,
    });

    if (
      !name ||
      !email ||
      !departmentId ||
      !locationId ||
      !role ||
      !employeeId
    ) {
      appLogger.warn("Missing required fields in user creation");
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Insert new user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        employeeId,
        locationId,
        departmentId,
        role: role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
        isActive: !!isActive,
      })
      .returning();

    appLogger.info(`User created successfully: ${newUser?.id || "unknown id"}`);
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    systemLogger.error(
      `Error creating user: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
