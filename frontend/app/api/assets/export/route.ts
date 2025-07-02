// frontend/app/api/assets/export/route.ts
// API route to export filtered assets as CSV or PDF using browserless.io
// Accepts filters, fetches all matching assets, generates a report

import { NextRequest, NextResponse } from "next/server";
import { db, assetsTable, locationsTable } from "@/lib/db";
import { eq, and, or, ilike, isNull, isNotNull } from "drizzle-orm";
import {
  generateTableReportHTML,
  generateTableCSV,
  generatePDFViaBrowserless,
} from "@/lib/server/exportUtils";

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

export async function POST(request: NextRequest) {
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

    // Build where conditions (reuse logic from GET handler)
    const whereConditions = [isNull(assetsTable.deletedAt)];
    if (type !== "all") {
      whereConditions.push(eq(assetsTable.type, type));
    }
    if (state !== "all") {
      whereConditions.push(eq(assetsTable.state, state));
    }
    if (status !== "all") {
      whereConditions.push(eq(assetsTable.status, status));
    }
    if (locationId !== "all") {
      whereConditions.push(eq(assetsTable.locationId, locationId));
    }
    if (assignedTo !== "all") {
      if (assignedTo === "unassigned") {
        whereConditions.push(isNull(assetsTable.assignedTo));
      } else {
        whereConditions.push(eq(assetsTable.assignedTo, assignedTo));
      }
    }
    if (search) {
      const searchConditions = [
        ilike(assetsTable.assetNumber, `%${search}%`),
        ilike(assetsTable.serialNumber, `%${search}%`),
        ilike(assetsTable.description, `%${search}%`),
      ];
      const assignedToSearch = and(
        isNotNull(assetsTable.assignedTo),
        ilike(assetsTable.assignedTo, `%${search}%`)
      );
      if (assignedToSearch) {
        searchConditions.push(assignedToSearch);
      }
      whereConditions.push(or(...searchConditions));
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
      updatedAt: new Date(asset.updatedAt).toLocaleString("en-GB"),
    }));
    const filters = { type, state, status, locationId, assignedTo, search };
    if (format === "csv") {
      // Generate CSV string
      const csv = generateTableCSV({ columns: assetColumns, rows: exportRows });
      // Return as downloadable CSV file
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=assets-report.csv`,
        },
      });
    } else {
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
    console.error("Asset export error:", error);
    return NextResponse.json(
      { error: "Failed to generate asset export" },
      { status: 500 }
    );
  }
}
