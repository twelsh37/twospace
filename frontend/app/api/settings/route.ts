// frontend/app/api/settings/route.ts
// API route to get and update the report cache duration setting

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settingsTable } from "@/lib/db/schema";

// GET: Return the current reportCacheDuration (in minutes)
export async function GET() {
  try {
    const settings = await db.select().from(settingsTable).limit(1);
    if (!settings.length) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      reportCacheDuration: settings[0].reportCacheDuration,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT: Update the reportCacheDuration (expects { reportCacheDuration: number })
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const value = Number(body.reportCacheDuration);
    if (!Number.isInteger(value) || value < 1 || value > 1440) {
      return NextResponse.json(
        {
          error:
            "Invalid value. Must be an integer between 1 and 1440 (minutes).",
        },
        { status: 400 }
      );
    }
    // Update the first (and only) settings row
    const updated = await db
      .update(settingsTable)
      .set({ reportCacheDuration: value, updatedAt: new Date() })
      .returning();
    return NextResponse.json({
      reportCacheDuration: updated[0].reportCacheDuration,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
