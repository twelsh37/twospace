// backend/app/api/users/route.ts
// API route to fetch paginated users from Supabase

import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/supabase-db";

// GET /api/users - returns paginated users
export async function GET(request: NextRequest) {
  const start = Date.now(); // Start timing
  try {
    // Parse query params for pagination and filters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const department = searchParams.get("department") || "all";
    const role = searchParams.get("role") || "all";

    const filters = {
      department: department !== "all" ? department : undefined,
      role: role !== "all" ? role : undefined,
    };

    const result = await getUsers(page, limit, filters);
    const responseTime = Date.now() - start;

    return NextResponse.json({
      ...result,
      responseTime,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - create a new user
export async function POST(request: NextRequest) {
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

    if (
      !name ||
      !email ||
      !departmentId ||
      !locationId ||
      !role ||
      !employeeId
    ) {
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
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
