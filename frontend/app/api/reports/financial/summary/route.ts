// frontend/app/api/reports/financial/summary/route.ts
// API route for financial summary reports

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

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetsTable, settingsTable } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

// Define a type for depreciation settings
interface DepreciationSettings {
  method?: string;
  years?: number;
  decliningPercents?: number[];
}

// Helper: Calculate depreciated value for a given asset
function calculateDepreciatedValue(
  purchasePrice: number,
  purchaseYear: number,
  currentYear: number,
  method: "straight" | "declining",
  years: number,
  decliningPercents: number[]
) {
  if (currentYear < purchaseYear) return 0;
  const age = currentYear - purchaseYear;
  if (age < 0) return purchasePrice;
  if (method === "straight") {
    // Straight line: value decreases by (100/years)% of original value each year
    const percentPerYear = 100 / years;
    const totalDepreciation = Math.min(age, years) * percentPerYear;
    const value = purchasePrice * (1 - totalDepreciation / 100);
    return value > 0 ? value : 0;
  } else {
    // Declining balance: value decreases by a set % of remaining value each year
    let value = purchasePrice;
    for (let i = 0; i < Math.min(age, years); i++) {
      const percent = decliningPercents[i] ?? 0;
      value = value * (1 - percent / 100);
    }
    return value > 0 ? value : 0;
  }
}

export async function GET() {
  // Log the start of the GET request
  appLogger.info("GET /api/reports/financial/summary called");
  try {
    // Fetch all assets (not deleted)
    const assets = await db
      .select({
        type: assetsTable.type,
        purchasePrice: assetsTable.purchasePrice,
        createdAt: assetsTable.createdAt,
      })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt));

    // Fetch depreciation settings (global)
    const settingsArr = await db.select().from(settingsTable).limit(1);
    const settingsRaw = settingsArr[0]?.depreciationSettings ?? null;
    // Type guard: check if settingsRaw is an object with expected properties
    let method = "straight";
    let years = 4;
    let decliningPercents = [50, 25, 12.5, 12.5];
    if (
      settingsRaw &&
      typeof settingsRaw === "object" &&
      ("method" in settingsRaw ||
        "years" in settingsRaw ||
        "decliningPercents" in settingsRaw)
    ) {
      const s = settingsRaw as DepreciationSettings;
      method = typeof s.method === "string" ? s.method : method;
      years = typeof s.years === "number" ? s.years : years;
      decliningPercents =
        Array.isArray(s.decliningPercents) && s.decliningPercents.length > 0
          ? s.decliningPercents
          : decliningPercents;
    }

    // Prepare for calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    // Find the earliest purchase year
    const allYears = assets
      .map((a) => {
        // Ensure createdAt is a string or Date, never null
        const createdAtValue = a.createdAt ?? "";
        return a.createdAt &&
          typeof a.createdAt === "object" &&
          "getFullYear" in a.createdAt
          ? (a.createdAt as Date).getFullYear()
          : new Date(createdAtValue).getFullYear();
      })
      .filter((y) => !!y);
    const minYear = allYears.length ? Math.min(...allYears) : currentYear;
    // Ensure method is either 'straight' or 'declining' for type safety
    const allowedMethods = ["straight", "declining"] as const;
    type DepMethod = (typeof allowedMethods)[number];
    const safeMethod: DepMethod = allowedMethods.includes(method as DepMethod)
      ? (method as DepMethod)
      : "straight";
    // --- Bar Chart: Value by Type (current value) ---
    const byType: Record<string, number> = {};
    for (const asset of assets) {
      const price = parseFloat(asset.purchasePrice as string);
      // Ensure createdAt is a string or Date, never null
      const createdAtValue = asset.createdAt ?? "";
      const purchaseYear =
        asset.createdAt &&
        typeof asset.createdAt === "object" &&
        "getFullYear" in asset.createdAt
          ? (asset.createdAt as Date).getFullYear()
          : new Date(createdAtValue).getFullYear();
      const value = calculateDepreciatedValue(
        price,
        purchaseYear,
        currentYear,
        safeMethod,
        years,
        decliningPercents
      );
      byType[asset.type] = (byType[asset.type] || 0) + value;
    }
    // --- Line Chart: Value over Years ---
    const byYear: Record<string, number> = {};
    for (let year = minYear; year <= currentYear; year++) {
      let total = 0;
      for (const asset of assets) {
        const price = parseFloat(asset.purchasePrice as string);
        // Ensure createdAt is a string or Date, never null
        const createdAtValue = asset.createdAt ?? "";
        const purchaseYear =
          asset.createdAt &&
          typeof asset.createdAt === "object" &&
          "getFullYear" in asset.createdAt
            ? (asset.createdAt as Date).getFullYear()
            : new Date(createdAtValue).getFullYear();
        if (purchaseYear > year) continue;
        const value = calculateDepreciatedValue(
          price,
          purchaseYear,
          year,
          safeMethod,
          years,
          decliningPercents
        );
        total += value;
      }
      byYear[year] = total;
    }
    appLogger.info("Aggregated financial summary", { byType, byYear });
    return NextResponse.json({ byType, byYear });
  } catch (err: unknown) {
    systemLogger.error(
      `Error in GET /api/reports/financial/summary: ${
        err instanceof Error ? err.stack : String(err)
      }`
    );
    return NextResponse.json(
      { error: "Failed to generate financial summary" },
      { status: 500 }
    );
  }
}
