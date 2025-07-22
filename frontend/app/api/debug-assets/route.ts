// frontend/app/api/debug-assets/route.ts
// Debug API route for asset management

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
import { db, assetsTable } from "@/lib/db";
import { appLogger } from "@/lib/logger";
import { requireAdmin } from "@/lib/supabase-auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await requireAdmin(request);
    if (authResult.error || !authResult.data.user) {
      return NextResponse.json(
        { success: false, error: authResult.error?.message || "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all assets with their status
    const allAssets = await db
      .select({
        id: assetsTable.id,
        assetNumber: assetsTable.assetNumber,
        type: assetsTable.type,
        description: assetsTable.description,
        state: assetsTable.state,
        status: assetsTable.status,
        assignedTo: assetsTable.assignedTo,
        deletedAt: assetsTable.deletedAt,
      })
      .from(assetsTable)
      .orderBy(assetsTable.type, assetsTable.assetNumber);

    // Group by status and state for analysis
    const statusCounts = allAssets.reduce((acc, asset) => {
      const key = `${asset.status}-${asset.state}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(asset);
      return acc;
    }, {} as Record<string, typeof allAssets>);

    // Count assets by status
    const statusSummary = Object.entries(statusCounts).map(([key, assets]) => ({
      statusState: key,
      count: assets.length,
      assets: assets.slice(0, 3).map((a) => ({
        id: a.id,
        assetNumber: a.assetNumber,
        type: a.type,
        description: a.description,
        assignedTo: a.assignedTo,
        deletedAt: a.deletedAt,
      })),
    }));

    return NextResponse.json({
      success: true,
      totalAssets: allAssets.length,
      statusSummary,
      allAssets: allAssets.slice(0, 10), // First 10 for debugging
    });
  } catch (error) {
    appLogger.error(
      `Error debugging assets: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to debug assets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
