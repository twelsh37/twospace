// filepath: frontend/lib/server/exportUtils.ts

// Utility for modular CSV and PDF export using browserless.io for PDF

import { format as csvFormat } from "@fast-csv/format";
import { Readable } from "stream";

interface ExportColumn {
  header: string;
  key: string;
}

interface GenerateTableReportHTMLParams {
  title: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  filters?: Record<string, unknown>;
}

/**
 * Generate HTML for a tabular report (for PDF export)
 * @param {Object} params
 * @param {string} params.title - Report title
 * @param {Array<{header: string, key: string}>} params.columns - Table columns
 * @param {Array<Object>} params.rows - Table data
 * @param {Object} [params.filters] - Optional filters applied
 * @returns {string} HTML string
 */
export function generateTableReportHTML({
  title,
  columns,
  rows,
  filters,
}: GenerateTableReportHTMLParams) {
  // Build filter summary if filters are provided
  let filterSummary = "";
  if (filters && Object.keys(filters).length > 0) {
    filterSummary =
      `<div class="meta">Filters: ` +
      Object.entries(filters)
        .map(([k, v]) => `${k}: <b>${v || "All"}</b>`)
        .join(" | ") +
      `</div>`;
  }
  // Build table header
  const headerHtml = columns
    .map((col: ExportColumn) => `<th>${col.header}</th>`)
    .join("");
  // Build table rows
  const rowsHtml = rows
    .map(
      (row: Record<string, unknown>, idx: number) =>
        `<tr class="${idx % 2 === 0 ? "even" : "odd"}">` +
        columns
          .map((col: ExportColumn) => `<td>${row[col.key] ?? ""}</td>`)
          .join("") +
        `</tr>`
    )
    .join("");
  // Compose full HTML
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 24mm 12mm 24mm 12mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f6f8fa; }
          .container { width: 100%; max-width: 100%; margin: 0 auto; padding: 0; }
          .accent-bar { height: 8px; width: 100%; background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%); border-radius: 8px 8px 0 0; margin-bottom: 0.5rem; }
          .title { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.2rem; margin-top: 0; color: #1d4ed8; letter-spacing: -1px; }
          .meta { font-size: 1.05rem; color: #555; margin-bottom: 1.5rem; }
          table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 1rem; margin-bottom: 40px; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(30,64,175,0.07); overflow: hidden; }
          th, td { padding: 0.6rem 0.5rem; text-align: left; }
          th { background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%); color: #fff; font-weight: 700; font-size: 1.05rem; border: none; }
          tr.even td { background: #f3f6fb; }
          tr.odd td { background: #fff; }
          td { border: none; border-bottom: 1px solid #e5e7eb; }
          tr:last-child td { border-bottom: none; }
          thead { display: table-header-group; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="accent-bar"></div>
          <div class="title">${title}</div>
          ${filterSummary}
          <div class="meta">Generated: ${new Date().toLocaleString(
            "en-GB"
          )}</div>
          <table>
            <thead><tr>${headerHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

interface GenerateTableCSVParams {
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
}

/**
 * Generate CSV for a tabular report
 * @param {Object} params
 * @param {Array<{header: string, key: string}>} params.columns - Table columns
 * @param {Array<Object>} params.rows - Table data
 * @returns {string} CSV string
 */
export function generateTableCSV({ columns, rows }: GenerateTableCSVParams) {
  // Helper to escape CSV values
  function escapeCSV(val: unknown): string {
    if (val == null) return "";
    const strVal = String(val);
    if (strVal.includes('"')) return `"${strVal.replace(/"/g, '""')}"`;
    if (strVal.search(/[",\n]/) >= 0) return `"${strVal}"`;
    return strVal;
  }
  // Header row
  const header = columns.map((col) => escapeCSV(col.header)).join(",");
  // Data rows
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCSV(row[col.key])).join(",")
  );
  return [header, ...dataRows].join("\r\n");
}

/**
 * Stream CSV for a tabular report using fast-csv
 * @param {Object} params
 * @param {Array<{header: string, key: string}>} params.columns - Table columns
 * @param {Array<Object>} params.rows - Table data
 * @returns {Readable} Node.js Readable stream
 */
export function generateTableCSVStream({
  columns,
  rows,
}: GenerateTableCSVParams): Readable {
  // Use an array of strings for headers (the keys)
  const headers = columns.map((col) => col.key);
  const csvStream = csvFormat({ headers, writeHeaders: true });
  // Write each row to the stream
  for (const row of rows) {
    csvStream.write(row);
  }
  csvStream.end();
  return csvStream;
}

// Helper: Generate PDF via browserless.io
export async function generatePDFViaBrowserless(html: string) {
  const browserlessToken = process.env.token;
  if (!browserlessToken) {
    throw new Error("Missing browserless.io token in environment");
  }
  const pdfRes = await fetch(
    `https://production-sfo.browserless.io/pdf?token=${browserlessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    }
  );
  if (!pdfRes.ok) {
    const errText = await pdfRes.text();
    throw new Error(`Failed to generate PDF via browserless.io: ${errText}`);
  }
  return Buffer.from(await pdfRes.arrayBuffer());
}
