// frontend/pages/api/reports/pdf.ts
// API route to generate Asset Inventory Report PDF using Puppeteer and client-provided chart images

import type { NextApiRequest, NextApiResponse } from "next";
// import puppeteer from "puppeteer"; // Remove Puppeteer

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
