"use client";
// filepath: frontend/app/reports/page.tsx
// Main Reports Page for IT Asset Management System
// This file contains navigation and placeholders for all report types.
// Uses Chart.js for graphs (Asset Inventory as example).
// Includes Print, Email, Share, and Export buttons.

import React, { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// List of report categories
const REPORTS = [
  "Asset Inventory",
  "Lifecycle Management",
  "Financial",
  "Compliance",
  "Utilization",
  "Maintenance",
  "Software License",
  "Security",
  "End-of-Life",
  "Audit",
];

// Placeholder component for each report type
function ReportPlaceholder({ title }: { title: string }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>{title} Report</h2>
      <p>
        Coming soon: Detailed {title.toLowerCase()} report with tables, charts,
        and export options.
      </p>
    </div>
  );
}

// Asset Inventory Report with summary API and smooth chart animation
function AssetInventoryReport() {
  // Ref for print functionality
  const printRef = useRef<HTMLDivElement>(null);
  // State for summary data
  const [assetCounts, setAssetCounts] = useState<{ [type: string]: number }>(
    {}
  );
  const [stateCounts, setStateCounts] = useState<{ [state: string]: number }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printTime, setPrintTime] = useState<string | null>(null);

  // Fetch summary data for the charts and tables
  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports/asset-inventory/summary");
        const json = await res.json();
        if (!json.byType || !json.byState)
          throw new Error(json.error || "Failed to fetch summary");
        setAssetCounts(json.byType);
        setStateCounts(json.byState);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  // Print handler (prints the chart and table)
  const handlePrint = () => {
    // Capture print time
    setPrintTime(new Date().toLocaleString());
    setTimeout(() => {
      if (printRef.current) {
        window.print();
      }
    }, 100); // Give time for printTime to update
  };

  // Prepare chart and table data for asset type
  const labels = Object.keys(assetCounts).sort();
  const data = {
    labels,
    datasets: [
      {
        data: labels.map((type) => assetCounts[type]),
        backgroundColor: labels.map((type) => {
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
        }),
      },
    ],
  };
  const options = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeOutQuart" as const,
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  // Prepare data for Assets by State chart
  const stateLabels = Object.keys(stateCounts).sort();
  const stateData = {
    labels: stateLabels,
    datasets: [
      {
        data: stateLabels.map((state) => stateCounts[state]),
        backgroundColor: stateLabels.map((state) => {
          switch (state) {
            case "AVAILABLE":
              return "#2563EB";
            case "SIGNED_OUT":
              return "#14B8A6";
            case "BUILT":
              return "#F59E42";
            case "READY_TO_GO":
              return "#7C3AED";
            case "ISSUED":
              return "#22C55E";
            default:
              return "#6B7280";
          }
        }),
      },
    ],
  };
  const stateOptions = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeOutQuart" as const,
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  return (
    <div>
      {/* Print-specific styles and Roboto font */}
      <style>{`
        /* Import Roboto for print */
        @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
        @media print {
          /* Only print the report content */
          body, html {
            background: #fff !important;
            font-family: 'Roboto', Arial, Helvetica, sans-serif !important;
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
          }
          .print-hide, header, nav, .sidebar, .search-bar, .notification, .user-menu {
            display: none !important;
          }
          .print-report-root {
            background: #fff !important;
            margin: 0 auto;
            padding: 2.5cm 2cm 2cm 2cm;
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
            page-break-after: avoid;
          }
          @page { size: A4 portrait; margin: 1.5cm; }
          .print-title {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 0.2rem;
            text-align: center;
          }
          .print-meta {
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 2.2rem;
            text-align: center;
          }
          .print-chart {
            width: 100%;
            max-width: 100%;
            height: 320px;
            margin: 0 auto 2.5rem auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-table {
            width: 100%;
            margin: 0 auto;
            margin-top: 2.5rem;
          }
          .print-table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1rem;
            background: #fff;
          }
          .print-table th, .print-table td {
            border: 1px solid #ccc;
            padding: 0.7rem 1rem;
            text-align: left;
          }
        }
        .print-report-root { font-family: 'Roboto', Arial, Helvetica, sans-serif; }
      `}</style>
      {/* Action buttons */}
      <div
        className="print-hide"
        style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}
      >
        <button onClick={handlePrint}>Print</button>
        <button disabled>Email (coming soon)</button>
        <button disabled>Share (coming soon)</button>
        <button disabled>Export (coming soon)</button>
      </div>
      {/* Loading and error states */}
      {loading && <p>Loading asset data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {/* Printable content */}
      {!loading && !error && (
        <div ref={printRef} className="print-report-root">
          {/* Report Heading */}
          <div className="print-title">Asset Inventory Report</div>
          <div className="print-meta">
            Prepared on: {printTime || "(will be set when printed)"}
          </div>
          {/* Chart in upper half */}
          <div className="print-chart">
            <Bar data={data} options={options} />
          </div>
          {/* Table beneath chart with whitespace */}
          <div className="print-table">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 0,
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Asset Type
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {labels.map((type) => (
                  <tr key={type}>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {type}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {new Intl.NumberFormat().format(assetCounts[type])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Assets by State chart and table below */}
          <div style={{ marginTop: "2.5rem" }}>
            <h2
              style={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              Assets by State
            </h2>
            <div className="print-chart">
              <Bar data={stateData} options={stateOptions} />
            </div>
            <div className="print-table">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: 0,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      Asset State
                    </th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stateLabels.map((state) => (
                    <tr key={state}>
                      <td
                        style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                      >
                        {state}
                      </td>
                      <td
                        style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                      >
                        {new Intl.NumberFormat().format(stateCounts[state])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Reports Page
export default function ReportsPage() {
  // Track selected report
  const [selected, setSelected] = useState(REPORTS[0]);

  // Render the selected report
  function renderReport() {
    if (selected === "Asset Inventory") return <AssetInventoryReport />;
    return <ReportPlaceholder title={selected} />;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{ fontWeight: "bold", fontSize: "2rem", marginBottom: "1.5rem" }}
      >
        Reports
      </h1>
      {/* Navigation for report types */}
      <nav
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {REPORTS.map((report) => (
          <button
            key={report}
            onClick={() => setSelected(report)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 6,
              border:
                selected === report ? "2px solid #0070f3" : "1px solid #ccc",
              background: selected === report ? "#e6f0fa" : "#fff",
              fontWeight: selected === report ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {report}
          </button>
        ))}
      </nav>
      {/* Render selected report */}
      {renderReport()}
    </div>
  );
}
