// backend/app/api/users/route.ts
// API route to fetch paginated users from the database using Drizzle ORM

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, departmentsTable } from "@/lib/db/schema";
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
    let role = searchParams.get("role") || "all";
    role = role.toUpperCase();

    // Build where conditions for filters
    const whereConditions = [];
    let joinDepartment = false;
    if (department !== "all") {
      joinDepartment = true;
    }
    if (role !== "all" && (role === "ADMIN" || role === "USER")) {
      whereConditions.push(eq(usersTable.role, role as "ADMIN" | "USER"));
    }

    // Only select columns needed for the frontend table
    let users;
    if (joinDepartment) {
      users = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          department: departmentsTable.name,
          isActive: usersTable.isActive,
          employeeId: usersTable.employeeId,
        })
        .from(usersTable)
        .innerJoin(
          departmentsTable,
          eq(usersTable.departmentId, departmentsTable.id)
        )
        .where(and(eq(departmentsTable.name, department), ...whereConditions))
        .limit(limit)
        .offset(offset);
    } else {
      if (whereConditions.length > 0) {
        users = await db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role,
            department: departmentsTable.name,
            isActive: usersTable.isActive,
            employeeId: usersTable.employeeId,
          })
          .from(usersTable)
          .innerJoin(
            departmentsTable,
            eq(usersTable.departmentId, departmentsTable.id)
          )
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
            department: departmentsTable.name,
            isActive: usersTable.isActive,
            employeeId: usersTable.employeeId,
          })
          .from(usersTable)
          .innerJoin(
            departmentsTable,
            eq(usersTable.departmentId, departmentsTable.id)
          )
          .limit(limit)
          .offset(offset);
      }
    }

    // Get total count for pagination (with filters)
    let totalCountResult;
    if (joinDepartment) {
      totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable)
        .innerJoin(
          departmentsTable,
          eq(usersTable.departmentId, departmentsTable.id)
        )
        .where(and(eq(departmentsTable.name, department), ...whereConditions));
    } else {
      if (whereConditions.length > 0) {
        totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(usersTable)
          .innerJoin(
            departmentsTable,
            eq(usersTable.departmentId, departmentsTable.id)
          )
          .where(and(...whereConditions));
      } else {
        totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(usersTable)
          .innerJoin(
            departmentsTable,
            eq(usersTable.departmentId, departmentsTable.id)
          );
      }
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

// POST /api/users - create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, department, role, isActive, employeeId } = body;
    if (!name || !email || !department || !role || !employeeId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    // Find departmentId and locationId by department name
    const dept = await db
      .select({
        id: departmentsTable.id,
        locationId: departmentsTable.locationId,
      })
      .from(departmentsTable)
      .where(eq(departmentsTable.name, department));
    if (!dept.length) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 400 }
      );
    }
    // Check for duplicate email or employeeId
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existing.length) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }
    const existingEmp = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.employeeId, employeeId));
    if (existingEmp.length) {
      return NextResponse.json(
        { error: "A user with this employee ID already exists." },
        { status: 409 }
      );
    }
    // Insert new user (must include locationId and departmentId)
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        departmentId: dept[0].id,
        locationId: dept[0].locationId,
        role: role.toUpperCase(),
        isActive: !!isActive,
        employeeId,
      })
      .returning();
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
