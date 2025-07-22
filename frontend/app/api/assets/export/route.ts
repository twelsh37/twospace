// frontend/app/api/assets/export/route.ts
// API route to export asset data as CSV or Excel

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
import { db, assetsTable, locationsTable } from "@/lib/db";
import { eq, and, or, ilike, isNull, SQL, Column } from "drizzle-orm";
import {
  generateTableReportHTML,
  generatePDFViaBrowserless,
  generateTableCSVStream, // <-- import the new streaming function
} from "@/lib/server/exportUtils";
import { systemLogger, appLogger } from "@/lib/logger";

// Define columns for the assets export (match table columns)
const assetColumns = [
  { header: "Asset Number", key: "assetNumber" },
  { header: "Type", key: "type" },
  { header: "Description", key: "description" },
  { header: "State", key: "state" },
  { header: "Location", key: "location" },
  { header: "Assigned To", key: "assignedTo" },
  { header: "Purchase Price", key: "purchasePrice" },
  { header: "Updated", key: "updatedAt" },
];

// Helper to safely call ilike and avoid undefined
function safeIlike(column: Column, value: string): SQL<unknown> | undefined {
  return value ? ilike(column, value) : undefined;
}

export async function POST(request: NextRequest) {
  // Log the start of the POST request
  appLogger.info("POST /api/assets/export called");
  try {
    // Accept filters and format in request body
    const {
      type = "all",
      state = "all",
      status = "all",
      locationId = "all",
      assignedTo = "all",
      search = "",
      format = "pdf",
    } = await request.json();
    // Log the filters and format being used
    appLogger.info("Exporting assets with filters", {
      type,
      state,
      status,
      locationId,
      assignedTo,
      search,
      format,
    });

    // Build where conditions (reuse logic from GET handler)
    const whereConditions = [isNull(assetsTable.deletedAt)];
    // Normalize filters to lowercase for comparison
    const typeFilter = String(type).toLowerCase();
    const stateFilter = String(state).toLowerCase();
    const statusFilter = String(status).toLowerCase();
    const locationIdFilter = String(locationId).toLowerCase();
    const assignedToFilter = String(assignedTo).toLowerCase();

    if (typeFilter !== "all") {
      whereConditions.push(eq(assetsTable.type, type));
    }
    if (stateFilter !== "all") {
      whereConditions.push(eq(assetsTable.state, state));
    }
    if (statusFilter !== "all") {
      whereConditions.push(eq(assetsTable.status, status));
    }
    if (locationIdFilter !== "all") {
      whereConditions.push(eq(assetsTable.locationId, locationId));
    }
    if (assignedToFilter !== "all") {
      if (assignedToFilter === "unassigned") {
        whereConditions.push(isNull(assetsTable.assignedTo));
      } else {
        whereConditions.push(eq(assetsTable.assignedTo, assignedTo));
      }
    }
    if (search) {
      const validConditions: SQL<unknown>[] = [];
      const assetNumberCond = safeIlike(assetsTable.assetNumber, `%${search}%`);
      if (assetNumberCond) validConditions.push(assetNumberCond);
      const serialNumberCond = safeIlike(
        assetsTable.serialNumber,
        `%${search}%`
      );
      if (serialNumberCond) validConditions.push(serialNumberCond);
      const descriptionCond = safeIlike(assetsTable.description, `%${search}%`);
      if (descriptionCond) validConditions.push(descriptionCond);
      if (validConditions.length === 1) {
        whereConditions.push(validConditions[0]);
      } else if (validConditions.length > 1) {
        // @ts-expect-error: Drizzle type definitions are too strict, but all values are guaranteed to be SQL expressions.
        whereConditions.push(or(...(validConditions as SQL<unknown>[])));
      }
    }

    // Get assets with location details
    const assetsWithLocations = await db
      .select({ asset: assetsTable, location: locationsTable })
      .from(assetsTable)
      .leftJoin(locationsTable, eq(assetsTable.locationId, locationsTable.id))
      .where(and(...whereConditions));

    // Map to export rows
    const exportRows = assetsWithLocations.map(({ asset, location }) => ({
      assetNumber: asset.assetNumber,
      type: asset.type,
      description: asset.description,
      state: asset.state,
      location: location?.name || "Unknown Location",
      assignedTo: asset.assignedTo || "Unassigned",
      purchasePrice: asset.purchasePrice,
      updatedAt: asset.updatedAt
        ? new Date(asset.updatedAt).toLocaleString("en-GB")
        : "",
    }));
    const filters = { type, state, status, locationId, assignedTo, search };
    if (format === "csv") {
      // Log CSV export
      appLogger.info(
        `Generating CSV export for assets (${exportRows.length} rows)`
      );
      // Stream CSV using fast-csv for large datasets
      const csvStream = generateTableCSVStream({
        columns: assetColumns,
        rows: exportRows,
      });
      // Return as downloadable CSV file (streamed)
      return new NextResponse(
        csvStream as unknown as ReadableStream<Uint8Array>,
        {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=assets-report.csv`,
          },
        }
      );
    } else {
      // Log PDF export
      appLogger.info(
        `Generating PDF export for assets (${exportRows.length} rows)`
      );
      // Generate HTML
      const html = generateTableReportHTML({
        title: "Asset Report",
        columns: assetColumns,
        rows: exportRows,
        filters,
      });
      // Generate PDF via browserless.io
      const pdfBuffer = await generatePDFViaBrowserless(html);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=assets-report.pdf`,
        },
      });
    }
  } catch (error) {
    systemLogger.error(
      `Asset export error: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to generate asset export" },
      { status: 500 }
    );
  }
}
