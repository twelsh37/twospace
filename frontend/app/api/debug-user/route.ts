// frontend/app/api/debug-user/route.ts
// Debug API route for user operations

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
