// frontend/app/api/test-auth/route.ts
// Simple test endpoint to verify authentication

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // Test admin authentication
    const {
      data: { user },
      error: authError,
    } = await requireAdmin(request);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          authError: authError?.message || "No user found",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      },
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
