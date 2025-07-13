// backend/app/api/users/route.ts
// API route to fetch paginated users from Supabase

import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/supabase-db";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireAuth, requireAdmin } from "@/lib/supabase-auth-helpers";

// GET /api/users - returns paginated users
export async function GET(request: NextRequest) {
  // Require authentication for listing users
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user; // Not authenticated
  // Log the start of the GET request
  appLogger.info(`GET /api/users called. URL: ${request.url}`);
  const start = Date.now(); // Start timing
  try {
    // Parse query params for pagination and filters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const department = searchParams.get("department") || "ALL";
    const role = searchParams.get("role") || "ALL";

    // Log the filters being used
    appLogger.info("GET /api/users - Filters:", {
      page,
      limit,
      department,
      role,
    });

    // Only include filters if not 'ALL'
    const filters: { department?: string; role?: string } = {};
    if (department && department.toUpperCase() !== "ALL") {
      filters.department = department;
    }
    if (role && role.toUpperCase() !== "ALL") {
      filters.role = role;
    }

    const result = await getUsers(page, limit, filters);
    const responseTime = Date.now() - start;

    appLogger.info(`Fetched users successfully in ${responseTime}ms`);
    return NextResponse.json({
      ...result,
      responseTime,
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
  // Log the start of the POST request
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

    // Log the user creation attempt
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

    // Use the provided departmentId and locationId
    const userData = {
      name,
      email,
      employee_id: employeeId,
      location_id: locationId, // Use real locationId
      department_id: departmentId, // Use real departmentId
      role: role.toUpperCase() as "ADMIN" | "USER",
      is_active: !!isActive,
    };

    const result = await createUser(userData);
    appLogger.info(
      `User created successfully: ${result.user?.id || "unknown id"}`
    );
    return NextResponse.json({ user: result.user }, { status: 201 });
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
