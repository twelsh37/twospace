// frontend/app/api/locations/export/route.ts
// API route for exporting location data

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
import { db, locationsTable } from "@/lib/db";
import { eq, ilike, and } from "drizzle-orm";
import {
  generateTableCSVStream,
  generatePDFViaBrowserless,
  generateTableReportHTML,
} from "@/lib/server/exportUtils";
import { appLogger, systemLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Define columns for the locations export
const locationColumns = [
  { header: "Name", key: "name" },
  { header: "Description", key: "description" },
  { header: "Active", key: "isActive" },
  { header: "Created At", key: "createdAt" },
  { header: "Updated At", key: "updatedAt" },
];

export async function GET(req: NextRequest) {
  appLogger.info("GET /api/locations/export called");
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const isActive = searchParams.get("isActive");
    // Build filter conditions
    const conditions = [];
    if (isActive && isActive.toUpperCase() !== "ALL") {
      if (isActive === "true") {
        conditions.push(eq(locationsTable.isActive, true));
      } else if (isActive === "false") {
        conditions.push(eq(locationsTable.isActive, false));
      }
    }
    if (name) {
      conditions.push(ilike(locationsTable.name, `%${name}%`));
    }
    // Fetch all locations matching filters
    let locations;
    if (conditions.length > 0) {
      locations = await db
        .select()
        .from(locationsTable)
        .where(and(...conditions))
        .orderBy(locationsTable.name);
    } else {
      locations = await db
        .select()
        .from(locationsTable)
        .orderBy(locationsTable.name);
    }
    // Prepare rows for export (ensure name is uppercase)
    const exportRows = locations.map((loc) => ({
      name: loc.name.toUpperCase(),
      description: loc.description || "",
      isActive: loc.isActive ? "Yes" : "No",
      createdAt: loc.createdAt
        ? new Date(loc.createdAt).toLocaleString("en-GB")
        : "",
      updatedAt: loc.updatedAt
        ? new Date(loc.updatedAt).toLocaleString("en-GB")
        : "",
    }));
    appLogger.info(`Exporting ${exportRows.length} locations as CSV`);
    // Stream CSV using fast-csv
    const csvStream = generateTableCSVStream({
      columns: locationColumns,
      rows: exportRows,
    });
    return new NextResponse(
      csvStream as unknown as ReadableStream<Uint8Array>,
      {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=locations-report.csv`,
        },
      }
    );
  } catch (error) {
    systemLogger.error(
      `Location export error: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to generate locations export" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Accept filters in the request body
  try {
    const { name, isActive, format = "csv" } = await req.json();
    // Build filter conditions
    const conditions = [];
    if (isActive && isActive.toUpperCase() !== "ALL") {
      if (isActive === "true") {
        conditions.push(eq(locationsTable.isActive, true));
      } else if (isActive === "false") {
        conditions.push(eq(locationsTable.isActive, false));
      }
    }
    if (name) {
      conditions.push(ilike(locationsTable.name, `%${name}%`));
    }
    // Fetch all locations matching filters
    let locations;
    if (conditions.length > 0) {
      locations = await db
        .select()
        .from(locationsTable)
        .where(and(...conditions))
        .orderBy(locationsTable.name);
    } else {
      locations = await db
        .select()
        .from(locationsTable)
        .orderBy(locationsTable.name);
    }
    // Prepare rows for export (ensure name is uppercase)
    const exportRows = locations.map((loc) => ({
      name: loc.name.toUpperCase(),
      description: loc.description || "",
      isActive: loc.isActive ? "Yes" : "No",
      createdAt: loc.createdAt
        ? new Date(loc.createdAt).toLocaleString("en-GB")
        : "",
      updatedAt: loc.updatedAt
        ? new Date(loc.updatedAt).toLocaleString("en-GB")
        : "",
    }));
    if (format === "pdf") {
      // Generate HTML for PDF
      const html = generateTableReportHTML({
        title: "Locations Report",
        columns: locationColumns,
        rows: exportRows,
        filters: { name, isActive },
      });
      // Generate PDF via browserless.io
      const pdfBuffer = await generatePDFViaBrowserless(html);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=locations-report.pdf`,
        },
      });
    }
    // Stream CSV using fast-csv
    const csvStream = generateTableCSVStream({
      columns: locationColumns,
      rows: exportRows,
    });
    return new NextResponse(
      csvStream as unknown as ReadableStream<Uint8Array>,
      {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=locations-report.csv`,
        },
      }
    );
  } catch (error) {
    systemLogger.error(
      `Location export error (POST): ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to generate locations export" },
      { status: 500 }
    );
  }
}
