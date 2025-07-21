// frontend/pages/api/reports/pdf.ts

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

// API route to generate Asset Inventory Report PDF using browserless.io REST API
// This endpoint receives chart images and table data from the client, builds an HTML report, and sends it to browserless.io for PDF generation.
// NOTE: All PDF rendering is handled by browserless.io cloud service. Puppeteer is not used or supported.

import type { NextApiRequest, NextApiResponse } from "next";
// import puppeteer from "puppeteer"; // No longer used

/**
 * API Handler for Asset Inventory PDF Export
 *
 * This endpoint receives POST requests with chart images and table data,
 * builds an HTML report, and sends it to browserless.io's REST API for PDF generation.
 *
 * Environment variable required:
 *   token=YOUR_BROWSERLESS_API_KEY
 *
 * This approach is compatible with Vercel and other serverless platforms.
 * See https://docs.browserless.io/ for more info.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const {
      chart1,
      chart2,
      chart3,
      chart4,
      assetTypes = [],
      assetCounts = {},
      stateTypes = [],
      stateCounts = {},
      buildingTypes = [],
      byTypeInBuilding = {},
      readyTypes = [],
      byTypeInReadyToGo = {},
    } = req.body;
    // Build HTML with the chart images and real tables
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Asset Inventory Report PDF</title>
          <style>
            body { font-family: Arial, sans-serif; background: #fff; margin: 0; padding: 0; width: 210mm; height: 297mm; box-sizing: border-box; }
            .pdf-container { width: 95%; margin: 0 auto; padding: 1.5rem 0 0 0; }
            .pdf-title { font-size: 2.2rem; font-weight: 700; margin-bottom: 0.2rem; margin-top: 0; text-align: left; }
            .pdf-meta { font-size: 1.1rem; color: #555; margin-bottom: 2.2rem; text-align: left; }
            .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.2rem 2.2rem; width: 100%; margin-bottom: 2.5rem; }
            .pdf-section { display: flex; flex-direction: column; background: #fafbfc; border: 1px solid #eee; border-radius: 8px; padding: 1rem; min-height: 220px; page-break-inside: avoid; }
            .pdf-section h2 { font-size: 1.2rem; font-weight: 600; margin: 0 0 0.7rem 0; text-align: left; }
            .pdf-chart-img { width: 100%; height: 120px; object-fit: contain; margin-bottom: 1.2rem; background: #e3e7ef; border-radius: 6px; display: block; }
            .pdf-table { width: 100%; font-size: 0.95rem; border-collapse: collapse; margin-top: 1rem; }
            .pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <div>
              <h1 class="pdf-title">Asset Inventory Report</h1>
              <div class="pdf-meta">Prepared on: ${new Date().toLocaleString(
                "en-GB"
              )}</div>
            </div>
            <div class="pdf-grid">
              <div class="pdf-section">
                <h2>Assets by Type</h2>
                <img class="pdf-chart-img" src="${chart1}" alt="Assets by Type Chart" />
                <table class="pdf-table">
                  <thead><tr><th>Asset Type</th><th>Count</th></tr></thead>
                  <tbody>
                    ${assetTypes
                      .map(
                        (type: string) =>
                          `<tr><td>${type}</td><td>${assetCounts[type]}</td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              <div class="pdf-section">
                <h2>Assets by State</h2>
                <img class="pdf-chart-img" src="${chart2}" alt="Assets by State Chart" />
                <table class="pdf-table">
                  <thead><tr><th>Asset State</th><th>Count</th></tr></thead>
                  <tbody>
                    ${stateTypes
                      .map(
                        (state: string) =>
                          `<tr><td>${state}</td><td>${stateCounts[state]}</td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              <div class="pdf-section">
                <h2>Assets in Build State</h2>
                <img class="pdf-chart-img" src="${chart3}" alt="Assets in Build State Chart" />
                <table class="pdf-table">
                  <thead><tr><th>Asset Type</th><th>Count</th></tr></thead>
                  <tbody>
                    ${buildingTypes
                      .map(
                        (type: string) =>
                          `<tr><td>${type}</td><td>${byTypeInBuilding[type]}</td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              <div class="pdf-section">
                <h2>Assets Ready to Go</h2>
                <img class="pdf-chart-img" src="${chart4}" alt="Assets Ready to Go Chart" />
                <table class="pdf-table">
                  <thead><tr><th>Asset Type</th><th>Count</th></tr></thead>
                  <tbody>
                    ${readyTypes
                      .map(
                        (type: string) =>
                          `<tr><td>${type}</td><td>${byTypeInReadyToGo[type]}</td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    // Use browserless.io to generate the PDF
    const browserlessToken = process.env.token;
    if (!browserlessToken) {
      return res
        .status(500)
        .json({ error: "Missing browserless.io token in environment" });
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
      console.error("Browserless PDF error:", errText);
      return res
        .status(500)
        .json({ error: "Failed to generate PDF via browserless.io" });
    }
    const pdfBuffer = await pdfRes.arrayBuffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=asset-inventory-report.pdf"
    );
    res.status(200).end(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error("PDF export error:", err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
