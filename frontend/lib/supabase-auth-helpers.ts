// frontend/lib/supabase-auth-helpers.ts
// Server-side Supabase Auth helpers for API route protection
// Provides requireAuth and requireAdmin for secure API endpoints

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper: Extract Supabase session from request (Authorization header or cookies)
export async function getSupabaseUserFromRequest(req: NextRequest) {
  // Try to get the access token from the Authorization header (Bearer)
  const authHeader = req.headers.get("authorization");
  let accessToken = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.replace("Bearer ", "");
  } else {
    // Fallback: Try to get from cookies (if using cookie-based auth)
    const cookie = req.cookies.get("sb-access-token")?.value;
    if (cookie) accessToken = cookie;
  }
  if (!accessToken) return null;
  // Create a Supabase client with the access token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  // Get the user session
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) return null;
  return data.user;
}

// Middleware: Require authentication
export async function requireAuth(req: NextRequest) {
  const user = await getSupabaseUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return user;
}

// Middleware: Require ADMIN role
export async function requireAdmin(req: NextRequest) {
  const user = await getSupabaseUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  // Check role from user metadata (assumes role is stored in user.user_metadata.role)
  const role = user.user_metadata?.role;
  if (role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 }
    );
  }
  return user;
}

/*
USAGE IN API ROUTES:

import { requireAdmin } from "@/lib/supabase-auth-helpers";

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user; // Not authorized
  // ...proceed with admin logic
}
*/
