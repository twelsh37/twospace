// backend/app/api/import/route.ts
// API endpoint for bulk importing assets, users, or locations via CSV/XLSX
// Accepts multipart/form-data with file, type, and format fields
// Returns a success or error message

import { NextRequest, NextResponse } from "next/server";
import { parse as parseCSV } from "csv-parse/sync";
import * as XLSX from "xlsx";
import {
  db,
  holdingAssetsTable, // Only import what is needed
} from "@/lib/db";
import type { NewHoldingAsset } from "@/lib/db/schema";

// Helper to parse CSV buffer
function parseCsvBuffer(buffer: Buffer) {
  return parseCSV(buffer.toString(), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// Helper to parse XLSX buffer
function parseXlsxBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
}

export async function POST(req: NextRequest) {
  try {
    // Use Fetch API's formData to handle file uploads in App Router
    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");
    const format = formData.get("format");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File not received or invalid." },
        { status: 400 }
      );
    }
    if (
      !type ||
      !format ||
      typeof type !== "string" ||
      typeof format !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing type or format." },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    let parsedData;
    if (format === "csv") {
      parsedData = parseCsvBuffer(fileBuffer);
    } else if (format === "xlsx") {
      parsedData = parseXlsxBuffer(fileBuffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file format." },
        { status: 400 }
      );
    }

    // If importing assets, insert them into the holding_assets table (not assets)
    if (type === "assets" && Array.isArray(parsedData)) {
      // Use the correct type for insert
      const holdingAssetsToInsert: NewHoldingAsset[] = [];
      for (const row of parsedData as Record<string, unknown>[]) {
        // Only require serialNumber and description
        if (!row.serialNumber || !row.description) continue;
        holdingAssetsToInsert.push({
          serialNumber: String(row.serialNumber),
          description: String(row.description),
          supplier: row.supplier ? String(row.supplier) : null,
          status: "pending", // Use the literal value to match enum
          rawData: row, // Store original row for traceability
          notes: row.notes ? String(row.notes) : null,
        });
      }
      if (holdingAssetsToInsert.length > 0) {
        await db.insert(holdingAssetsTable).values(holdingAssetsToInsert);
      }
    }
    return NextResponse.json({
      message: "Import successful.",
      data: parsedData,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}
