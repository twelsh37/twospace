// frontend/app/api/holding-assets/route.ts
// API route for holding assets management

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
import { db } from "@/lib/db";
import { holdingAssetsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireAdmin } from "@/lib/supabase-auth-helpers";

export async function GET(req: NextRequest) {
  // Require ADMIN role for viewing holding assets
  const authResult = await requireAdmin(req);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authorized" },
      { status: 403 }
    );
  }

  // Log the start of the GET request
  appLogger.info("GET /api/holding-assets called");

  try {
    // Require authentication
    const user = authResult.data.user;

    appLogger.info(`Fetching holding assets for user: ${user.email}`);

    const assets = await db.select().from(holdingAssetsTable);
    appLogger.info(`Fetched ${assets.length} holding assets successfully`);
    return NextResponse.json({ data: { assets } });
  } catch (error) {
    systemLogger.error(
      `Error fetching holding assets: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch holding assets." },
      { status: 500 }
    );
  }
}
