// backend/pages/api/import.ts
// API endpoint for bulk importing assets, users, or locations via CSV/XLSX
// Accepts multipart/form-data with file, type, and format fields
// Returns a success or error message

import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import { parse as parseCSV } from "csv-parse/sync";
import * as XLSX from "xlsx";
import fs from "fs";

// NOTE: To use formidable with TypeScript, install types:
// yarn add -D @types/formidable

// Disable Next.js default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Store last imported data in memory for demo purposes
let lastImportedData: any[] = [];

// Helper to parse multipart form data using formidable
function parseFormData(
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ multiples: false, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Return last imported data if requested
    if (req.query.last === "true") {
      res.status(200).json({ data: lastImportedData });
      return;
    }
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    // Parse the incoming form data
    const { fields, files } = await parseFormData(req);
    console.log("Received files:", files); // Debug log
    const fileField = files.file;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    // Handle type and format as string or string[]
    let type: string | undefined = undefined;
    let format: string | undefined = undefined;
    if (Array.isArray(fields.type)) type = fields.type[0];
    else if (typeof fields.type === "string") type = fields.type;
    if (Array.isArray(fields.format)) format = fields.format[0];
    else if (typeof fields.format === "string") format = fields.format;
    if (!file || !file.filepath) {
      res.status(400).json({ error: "File not received or invalid." });
      return;
    }
    if (!type || !format) {
      res.status(400).json({ error: "Missing type or format." });
      return;
    }
    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    let parsedData;
    if (format === "csv") {
      parsedData = parseCsvBuffer(fileBuffer);
    } else if (format === "xlsx") {
      parsedData = parseXlsxBuffer(fileBuffer);
    } else {
      res.status(400).json({ error: "Unsupported file format." });
      return;
    }
    // Store last imported data for GET requests
    lastImportedData = Array.isArray(parsedData) ? parsedData : [];
    // TODO: Validate required fields based on type
    // TODO: When inserting assets, set status = 'holding'
    // Example:
    // await db.insert(assetsTable).values({ ...asset, status: 'holding' })
    // For now, just return the parsed data
    res.status(200).json({ message: "Import successful.", data: parsedData });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ error: "Import failed." });
  }
}
