// frontend/pages/api/reports/pdf.ts
// API route to generate Asset Inventory Report PDF using Puppeteer and chartjs-node-canvas (Node.js only)

import type { NextApiRequest, NextApiResponse } from "next";
import { generateAssetInventoryPDF } from "@/lib/server/pdfExport";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const baseUrl = `${req.headers["x-forwarded-proto"] || "http"}://${
      req.headers.host
    }`;
    const pdfBuffer = await generateAssetInventoryPDF(baseUrl);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=asset-inventory-report.pdf"
    );
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error("PDF export error:", err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
