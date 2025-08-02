// frontend/app/api/settings/route.ts
// API route for application settings

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
import { settingsTable } from "@/lib/db/schema";
import { systemLogger, appLogger } from "@/lib/logger";
import { requireUser } from "@/lib/supabase-auth-helpers";

// GET: Return the current reportCacheDuration (in minutes) and depreciationSettings
export async function GET(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for viewing settings
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  // Log the start of the GET request
  appLogger.info("GET /api/settings called");
  try {
    const settings = await db.select().from(settingsTable).limit(1);
    if (!settings.length) {
      appLogger.warn("Settings not found in GET /api/settings");
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }
    appLogger.info("Fetched settings successfully");
    // Always include depreciationSettings in the response
    return NextResponse.json({
      reportCacheDuration: settings[0].reportCacheDuration,
      depreciationSettings: settings[0].depreciationSettings || null,
    });
  } catch (err) {
    systemLogger.error(
      `Error fetching settings: ${
        err instanceof Error ? err.stack : String(err)
      }`
    );
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT: Update the reportCacheDuration and/or depreciationSettings
export async function PUT(request: NextRequest) {
  // Require any authenticated user (ADMIN or USER) for updating settings
  const authResult = await requireUser(request);
  if (authResult.error || !authResult.data.user) {
    return NextResponse.json(
      { error: authResult.error?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  // Log the start of the PUT request
  appLogger.info("PUT /api/settings called");
  try {
    const body = await request.json();
    appLogger.info("Settings update request body", body);
    const updateData: Record<string, unknown> = {};
    // Validate and update reportCacheDuration if present
    if (body.reportCacheDuration !== undefined) {
      const value = Number(body.reportCacheDuration);
      if (!Number.isInteger(value) || value < 1 || value > 1440) {
        appLogger.warn("Invalid reportCacheDuration in settings update", {
          value,
        });
        return NextResponse.json(
          {
            error:
              "Invalid value. Must be an integer between 1 and 1440 (minutes).",
          },
          { status: 400 }
        );
      }
      updateData.reportCacheDuration = value;
    }
    // Update depreciationSettings if present
    if (body.depreciationSettings !== undefined) {
      updateData.depreciationSettings = body.depreciationSettings;
    }
    if (Object.keys(updateData).length === 0) {
      appLogger.warn("No valid fields to update in settings PUT");
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }
    updateData.updatedAt = new Date();
    // Update the first (and only) settings row
    const updated = await db.update(settingsTable).set(updateData).returning();
    appLogger.info("Settings updated successfully");
    return NextResponse.json({
      reportCacheDuration: updated[0].reportCacheDuration,
      depreciationSettings: updated[0].depreciationSettings || null,
    });
  } catch (err) {
    systemLogger.error(
      `Error updating settings: ${
        err instanceof Error ? err.stack : String(err)
      }`
    );
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
