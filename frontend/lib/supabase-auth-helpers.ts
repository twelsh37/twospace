// frontend/lib/supabase-auth-helpers.ts

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

// Server-side Supabase Auth helpers for API route protection
// Provides requireAuth and requireAdmin for secure API endpoints

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper: Extract Supabase session from request (Authorization header or cookies)
export async function getSupabaseUserFromRequest(req: NextRequest) {
  console.log("=== AUTH DEBUG ===");
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  // Try to get the access token from the Authorization header (Bearer)
  const authHeader = req.headers.get("authorization");
  console.log("Authorization header:", authHeader);

  let accessToken = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.replace("Bearer ", "");
    console.log("Extracted access token from header");
  } else {
    // Fallback: Try to get from cookies (if using cookie-based auth)
    const cookie = req.cookies.get("sb-access-token")?.value;
    console.log("Cookie value:", cookie);
    if (cookie) accessToken = cookie;
  }

  console.log("Final access token:", accessToken ? "Present" : "Missing");
  if (!accessToken) {
    console.log("No access token found");
    return null;
  }

  // Create a Supabase client with the access token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  // Get the user session
  console.log("Calling supabase.auth.getUser");
  const { data, error } = await supabase.auth.getUser(accessToken);
  console.log("Supabase response - error:", error);
  console.log("Supabase response - user:", data?.user ? "Present" : "Missing");

  if (error || !data?.user) {
    console.log("Authentication failed");
    return null;
  }

  console.log("Authentication successful for user:", data.user.email);
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

// Middleware: Require any authenticated user (ADMIN or USER)
export async function requireUser(req: NextRequest) {
  const user = await getSupabaseUserFromRequest(req);
  if (!user) {
    return { data: { user: null }, error: { message: "Not authenticated" } };
  }

  // Check role from Supabase Auth metadata
  const role = user.user_metadata?.role;
  console.log("User role from metadata:", role);
  console.log("User email:", user.email);

  // Check if user has ADMIN or USER role in metadata
  if (role === "ADMIN" || role === "USER") {
    console.log("User is authenticated with role:", role);
    return { data: { user }, error: null };
  }

  // Fallback: Check if user is admin based on email (for backward compatibility)
  if (
    user.email === "tom.welsh@gtrailway.com" ||
    user.email === "tom.welsh@theaiaa.com"
  ) {
    console.log("User is ADMIN based on email fallback");
    return { data: { user }, error: null };
  }

  // Default to USER role for backward compatibility
  console.log("User has no role, defaulting to USER");
  return { data: { user }, error: null };
}

// Middleware: Require ADMIN role only
export async function requireAdmin(req: NextRequest) {
  const user = await getSupabaseUserFromRequest(req);
  if (!user) {
    return { data: { user: null }, error: { message: "Not authenticated" } };
  }

  // Check role from Supabase Auth metadata
  const role = user.user_metadata?.role;
  console.log("User role from metadata:", role);
  console.log("User email:", user.email);

  // Check if user has ADMIN role in metadata
  if (role === "ADMIN") {
    console.log("User is ADMIN based on metadata");
    return { data: { user }, error: null };
  }

  // Fallback: Check if user is admin based on email (for backward compatibility)
  if (
    user.email === "tom.welsh@gtrailway.com" ||
    user.email === "tom.welsh@theaiaa.com"
  ) {
    console.log("User is ADMIN based on email fallback");
    return { data: { user }, error: null };
  }

  console.log("User is not ADMIN");
  return {
    data: { user: null },
    error: { message: "Forbidden: Admins only" },
  };
}

/*
USAGE IN API ROUTES:

// For routes that require any authenticated user (ADMIN or USER)
import { requireUser } from "@/lib/supabase-auth-helpers";
export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (user.error) return NextResponse.json(user.error, { status: 401 });
  // ... proceed with user logic
}

// For routes that require ADMIN role only
import { requireAdmin } from "@/lib/supabase-auth-helpers";
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user.error) return NextResponse.json(user.error, { status: 403 });
  // ... proceed with admin logic
}
*/
