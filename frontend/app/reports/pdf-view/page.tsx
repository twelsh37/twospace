// frontend/app/reports/pdf-view/page.tsx
// PDF-only Asset Inventory Report view for Puppeteer export
// This page is NOT shown to users directly. It is rendered by Puppeteer for PDF export.

import React from "react";

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

export default function PDFReportView() {
  // Read chart images from query params
  let chart1 = "",
    chart2 = "",
    chart3 = "",
    chart4 = "";
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    chart1 = params.get("chart1") || "";
    chart2 = params.get("chart2") || "";
    chart3 = params.get("chart3") || "";
    chart4 = params.get("chart4") || "";
  }
  // In production, fetch real report data here (SSR or API call)
  // For now, use placeholders for tables
  const preparedOn = getBritishDateTime();

  return (
    <html>
      <head>
        <title>Asset Inventory Report PDF</title>
        {/* PDF-specific styles: A4, no margin, 2x2 grid, professional look */}
        <style>{`
          body {
            font-family: Arial, sans-serif;
            background: #fff;
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
          }
          .pdf-container {
            width: 95%;
            margin: 0 auto;
            padding: 1.5rem 0 0 0;
          }
          .pdf-title {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 0.2rem;
            margin-top: 0;
            text-align: left;
          }
          .pdf-meta {
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 2.2rem;
            text-align: left;
          }
          .pdf-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2.2rem 2.2rem;
            width: 100%;
            margin-bottom: 2.5rem;
          }
          .pdf-section {
            display: flex;
            flex-direction: column;
            background: #fafbfc;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 1rem;
            min-height: 220px;
            page-break-inside: avoid;
          }
          .pdf-section h2 {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 0.7rem 0;
            text-align: left;
          }
          .pdf-chart-img {
            width: 100%;
            height: 120px;
            object-fit: contain;
            margin-bottom: 1.2rem;
            background: #e3e7ef;
            border-radius: 6px;
            display: block;
          }
          .pdf-chart-placeholder {
            width: 100%;
            height: 120px;
            background: #e3e7ef;
            border-radius: 6px;
            margin-bottom: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 1rem;
          }
          .pdf-table-placeholder {
            width: 100%;
            height: 40px;
            background: #f5f5f5;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #aaa;
            font-size: 0.95rem;
          }
        `}</style>
      </head>
      <body>
        <div className="pdf-container">
          {/* Title and prepared-on date at the top */}
          <div>
            <h1 className="pdf-title">Asset Inventory Report</h1>
            <div className="pdf-meta">Prepared on: {preparedOn}</div>
          </div>
          {/* 2x2 grid for charts/tables */}
          <div className="pdf-grid">
            {/* Section 1: Assets by Type */}
            <div className="pdf-section">
              <h2>Assets by Type</h2>
              {chart1 ? (
                <img
                  className="pdf-chart-img"
                  src={chart1}
                  alt="Assets by Type Chart"
                />
              ) : (
                <div className="pdf-chart-placeholder">
                  [Bar Chart Placeholder]
                </div>
              )}
              {/* TODO: Insert real table here */}
              <div className="pdf-table-placeholder">[Table Placeholder]</div>
            </div>
            {/* Section 2: Assets by State */}
            <div className="pdf-section">
              <h2>Assets by State</h2>
              {chart2 ? (
                <img
                  className="pdf-chart-img"
                  src={chart2}
                  alt="Assets by State Chart"
                />
              ) : (
                <div className="pdf-chart-placeholder">
                  [Bar Chart Placeholder]
                </div>
              )}
              <div className="pdf-table-placeholder">[Table Placeholder]</div>
            </div>
            {/* Section 3: Assets in Build State */}
            <div className="pdf-section">
              <h2>Assets in Build State</h2>
              {chart3 ? (
                <img
                  className="pdf-chart-img"
                  src={chart3}
                  alt="Assets in Build State Chart"
                />
              ) : (
                <div className="pdf-chart-placeholder">
                  [Bar Chart Placeholder]
                </div>
              )}
              <div className="pdf-table-placeholder">[Table Placeholder]</div>
            </div>
            {/* Section 4: Assets Ready to Go */}
            <div className="pdf-section">
              <h2>Assets Ready to Go</h2>
              {chart4 ? (
                <img
                  className="pdf-chart-img"
                  src={chart4}
                  alt="Assets Ready to Go Chart"
                />
              ) : (
                <div className="pdf-chart-placeholder">
                  [Bar Chart Placeholder]
                </div>
              )}
              <div className="pdf-table-placeholder">[Table Placeholder]</div>
            </div>
          </div>
          {/* You can add a footer or notes here if needed */}
        </div>
      </body>
    </html>
  );
}
