// frontend/lib/server/pdfExport.ts
// Utility to generate Asset Inventory Report PDF with charts using Puppeteer and chartjs-node-canvas

import puppeteer, { type Browser } from "puppeteer";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ChartConfiguration } from "chart.js";

// Helper to fetch summary data from the same API as the web report
async function fetchSummaryData(baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/reports/asset-inventory/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary data");
  return res.json();
}

// Helper to generate a bar chart as a base64 PNG
type BarChartParams = { labels: string[]; data: number[]; colors: string[] };
async function generateBarChart({ labels, data, colors }: BarChartParams) {
  const width = 600,
    height = 250;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const config: ChartConfiguration<"bar"> = {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: {
      plugins: { legend: { display: false }, title: { display: false } },
      scales: {
        x: {
          ticks: { font: { size: 14, weight: "bold" as const } },
        },
        y: { beginAtZero: true },
      },
    },
  };
  return await chartJSNodeCanvas.renderToDataURL(config); // data:image/png;base64,...
}

// Helper to get current date/time in British format (DD/MM/YYYY HH:mm)
function getBritishDateTime() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    pad(now.getDate()) +
    "/" +
    pad(now.getMonth() + 1) +
    "/" +
    now.getFullYear() +
    " " +
    pad(now.getHours()) +
    ":" +
    pad(now.getMinutes())
  );
}

// Main export: generate the PDF buffer
export async function generateAssetInventoryPDF(
  baseUrl: string
): Promise<Buffer> {
  let browser: Browser | null = null;
  try {
    // 1. Fetch summary data
    const summary = await fetchSummaryData(baseUrl);
    // 2. Prepare chart data (same logic as frontend)
    const assetTypes = Object.keys(summary.byType).sort();
    const assetTypeColors = assetTypes.map((type) => {
      switch (type) {
        case "LAPTOP":
          return "#3B82F6";
        case "MONITOR":
          return "#22C55E";
        case "MOBILE_PHONE":
          return "#A21CAF";
        case "DESKTOP":
          return "#F59E42";
        case "TABLET":
          return "#EC4899";
        default:
          return "#6B7280";
      }
    });
    const stateTypes = Object.keys(summary.byState).sort();
    const stateColors = stateTypes.map((state) => {
      switch (state) {
        case "AVAILABLE":
          return "#2563EB";
        case "SIGNED_OUT":
          return "#14B8A6";
        case "BUILDING":
          return "#F59E42";
        case "READY_TO_GO":
          return "#7C3AED";
        case "ISSUED":
          return "#22C55E";
        default:
          return "#6B7280";
      }
    });
    // 3. Generate chart images
    const chart1 = await generateBarChart({
      labels: assetTypes,
      data: assetTypes.map((type) => summary.byType[type]),
      colors: assetTypeColors,
    });
    const chart2 = await generateBarChart({
      labels: stateTypes,
      data: stateTypes.map((state) => summary.byState[state]),
      colors: stateColors,
    });
    const buildingTypes = Object.keys(summary.byTypeInBuilding || {}).sort();
    const buildingColors = buildingTypes.map(
      (type) => assetTypeColors[assetTypes.indexOf(type)] || "#6B7280"
    );
    const chart3 = await generateBarChart({
      labels: buildingTypes,
      data: buildingTypes.map((type) => summary.byTypeInBuilding[type]),
      colors: buildingColors,
    });
    const readyTypes = Object.keys(summary.byTypeInReadyToGo || {}).sort();
    const readyColors = readyTypes.map(
      (type) => assetTypeColors[assetTypes.indexOf(type)] || "#6B7280"
    );
    const chart4 = await generateBarChart({
      labels: readyTypes,
      data: readyTypes.map((type) => summary.byTypeInReadyToGo[type]),
      colors: readyColors,
    });
    // 4. Build the HTML for the PDF directly (no /reports/pdf-view route)
    const preparedOn = getBritishDateTime();
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
              <div class="pdf-meta">Prepared on: ${preparedOn}</div>
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
                        (type) =>
                          `<tr><td>${type}</td><td>${summary.byType[type]}</td></tr>`
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
                        (state) =>
                          `<tr><td>${state}</td><td>${summary.byState[state]}</td></tr>`
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
                        (type) =>
                          `<tr><td>${type}</td><td>${summary.byTypeInBuilding[type]}</td></tr>`
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
                        (type) =>
                          `<tr><td>${type}</td><td>${summary.byTypeInReadyToGo[type]}</td></tr>`
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
    // 5. Launch Puppeteer and render the HTML directly
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "10mm", bottom: "20mm", left: "10mm" },
    });
    await browser.close();
    // Convert Uint8Array to Buffer for Node.js compatibility
    return Buffer.from(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}
// End of file
