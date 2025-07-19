// frontend/app/api/users/by-email/route.ts
// API route to get a user by email for role checking

import { NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/supabase-auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // Require authentication but not admin (users can check their own role)
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user; // Not authenticated

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: dbUser[0],
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
