// frontend/app/api/debug-user/route.ts
// Debug endpoint to check user information

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-auth-helpers";
import { db, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error || !authResult.data.user) {
      return NextResponse.json(
        { error: authResult.error?.message || "Not authorized" },
        { status: 401 }
      );
    }
    const user = authResult.data.user;

    console.log("Debug user endpoint - Supabase user:", {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
    });

    // Check if user exists in database
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email || ""))
      .limit(1);

    console.log("Database user lookup result:", dbUser);

    return NextResponse.json({
      success: true,
      supabaseUser: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      },
      databaseUser: dbUser.length > 0 ? dbUser[0] : null,
      existsInDatabase: dbUser.length > 0,
    });
  } catch (error) {
    console.error("Debug user endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
