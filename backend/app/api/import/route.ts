// backend/app/api/import/route.ts
// API endpoint for bulk importing assets, users, or locations via CSV/XLSX
// Accepts multipart/form-data with file, type, and format fields
// Returns a success or error message

import { NextRequest, NextResponse } from "next/server";
import { parse as parseCSV } from "csv-parse/sync";
import * as XLSX from "xlsx";
import {
  db,
  assetsTable,
  locationsTable,
  type NewAsset,
  Location,
  assetTypeEnum,
  assetStateEnum,
  assignmentTypeEnum,
} from "@/lib/db";

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

// Helper type guards for enums
function isAssetType(
  val: unknown
): val is (typeof assetTypeEnum.enumValues)[number] {
  return (
    typeof val === "string" &&
    assetTypeEnum.enumValues.includes(
      val as (typeof assetTypeEnum.enumValues)[number]
    )
  );
}
function isAssetState(
  val: unknown
): val is (typeof assetStateEnum.enumValues)[number] {
  return (
    typeof val === "string" &&
    assetStateEnum.enumValues.includes(
      val as (typeof assetStateEnum.enumValues)[number]
    )
  );
}
function isAssignmentType(
  val: unknown
): val is (typeof assignmentTypeEnum.enumValues)[number] {
  return (
    typeof val === "string" &&
    assignmentTypeEnum.enumValues.includes(
      val as (typeof assignmentTypeEnum.enumValues)[number]
    )
  );
}

// Defensive date parsing for createdAt and updatedAt
function parseValidDate(val: unknown) {
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? new Date() : d;
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

    // If importing assets, insert them into the database with status 'holding'
    if (type === "assets" && Array.isArray(parsedData)) {
      // Get all locations for mapping name to id
      const locations: Location[] = await db.select().from(locationsTable);
      // Find the IT Department - store room location
      const itStoreRoom = locations.find(
        (loc) => loc.name.trim().toLowerCase() === "it department - store room"
      );
      if (!itStoreRoom) {
        return NextResponse.json(
          { error: "IT Department - store room location not found." },
          { status: 500 }
        );
      }
      const assetsToInsert: NewAsset[] = [];
      for (const row of parsedData as Record<string, unknown>[]) {
        // Validate and map enums
        const typeValue = isAssetType(row.type) ? row.type : null;
        const stateValue = isAssetState(row.state) ? row.state : "AVAILABLE";
        const assignmentTypeValue = isAssignmentType(row.assignmentType)
          ? row.assignmentType
          : "INDIVIDUAL";
        if (!typeValue) {
          console.warn(`Skipping asset with invalid type: ${row.type}`);
          continue;
        }
        // Always use IT Department - store room for imported assets
        const locationId = itStoreRoom.id;
        assetsToInsert.push({
          // Do not set assetNumber for imported assets; it will be assigned later
          assetNumber: null,
          type: typeValue,
          state: stateValue,
          serialNumber: String(row.serialNumber),
          description: String(row.description),
          purchasePrice: row.purchasePrice ? String(row.purchasePrice) : "0",
          locationId,
          assignmentType: assignmentTypeValue,
          assignedTo: row.assignedTo ? String(row.assignedTo) : null,
          employeeId: row.employeeId ? String(row.employeeId) : null,
          department: row.department ? String(row.department) : null,
          createdAt: parseValidDate(row.createdAt),
          updatedAt: parseValidDate(row.updatedAt),
          status: "holding",
        });
      }
      if (assetsToInsert.length > 0) {
        await db.insert(assetsTable).values(assetsToInsert);
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
