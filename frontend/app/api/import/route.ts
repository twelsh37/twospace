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
import { inArray } from "drizzle-orm";

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
      const allSerialNumbers: string[] = [];
      console.log("Parsed data:", parsedData);
      let firstRowKeys: string[] = [];
      let firstNormalizedKeys: string[] = [];
      for (const [i, row] of (
        parsedData as Record<string, unknown>[]
      ).entries()) {
        if (i === 0) firstRowKeys = Object.keys(row);
        // Robustly strip BOM and whitespace from all keys
        const normalizedRow: Record<string, unknown> = {};
        for (const key in row) {
          const cleanKey = key.replace(/^[\uFEFF\s]+/, "");
          normalizedRow[cleanKey] = row[key];
        }
        if (i === 0) firstNormalizedKeys = Object.keys(normalizedRow);
        // Accept both camelCase and snake_case keys
        const serialNumber =
          normalizedRow.serialNumber ||
          normalizedRow["serialNumber"] ||
          normalizedRow.serial_number ||
          normalizedRow["serial_number"];
        const description =
          normalizedRow.description ||
          normalizedRow["description"] ||
          normalizedRow.Description ||
          normalizedRow["Description"];
        if (!serialNumber || !description) continue;
        allSerialNumbers.push(String(serialNumber));
        holdingAssetsToInsert.push({
          serialNumber: String(serialNumber),
          description: String(description),
          supplier: normalizedRow.supplier
            ? String(normalizedRow.supplier)
            : null,
          status: "pending", // Use the literal value to match enum
          rawData: normalizedRow, // Store original row for debugging
          notes: normalizedRow.notes ? String(normalizedRow.notes) : null,
        });
      }
      // Log normalized keys for debugging
      if (firstRowKeys.length > 0) {
        console.log("First row original keys:", firstRowKeys);
        console.log("First row normalized keys:", firstNormalizedKeys);
      }
      // Check for existing serial numbers in the DB
      let existingSerials: string[] = [];
      if (holdingAssetsToInsert.length > 0) {
        const dbSerials = await db
          .select({ serialNumber: holdingAssetsTable.serialNumber })
          .from(holdingAssetsTable)
          .where(inArray(holdingAssetsTable.serialNumber, allSerialNumbers));
        existingSerials = dbSerials.map((row) => row.serialNumber);
      }
      // Filter out duplicates
      const uniqueAssetsToInsert = holdingAssetsToInsert.filter(
        (asset) => !existingSerials.includes(asset.serialNumber)
      );
      const skippedSerials = holdingAssetsToInsert
        .filter((asset) => existingSerials.includes(asset.serialNumber))
        .map((asset) => asset.serialNumber);
      if (skippedSerials.length > 0) {
        console.log("Skipped duplicate serial numbers:", skippedSerials);
      }
      if (uniqueAssetsToInsert.length === 0) {
        return NextResponse.json(
          {
            warning:
              "All serial numbers in your import already exist in the holding assets table.",
            skippedSerials,
            parsedData,
            firstRowKeys,
            firstNormalizedKeys,
          },
          { status: 400 }
        );
      }
      // Insert only unique assets
      await db.insert(holdingAssetsTable).values(uniqueAssetsToInsert);
      // Return a warning if some were skipped, otherwise success
      if (skippedSerials.length > 0) {
        return NextResponse.json(
          {
            message: "Import completed with some duplicates skipped.",
            skippedSerials,
            insertedCount: uniqueAssetsToInsert.length,
          },
          { status: 200 }
        );
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
