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
import { useSearchParams } from "next/navigation";

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
  // Always set printTime to the time the report is generated, in British format (DD/MM/YYYY, 24-hour clock)
  // Fix hydration error: set printTime only on the client
  const [printTime, setPrintTime] = useState<string>("");
  useEffect(() => {
    setPrintTime(
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );
  }, []);
  // Add state for new breakdowns
  const [byTypeInBuilt, setByTypeInBuilt] = useState<{
    [type: string]: number;
  }>({});
  const [byTypeInReadyToGo, setByTypeInReadyToGo] = useState<{
    [type: string]: number;
  }>({});
  // State for export loading
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch summary data for the charts and tables
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/reports/asset-inventory/summary");
        const json = await res.json();
        if (!json.byType || !json.byState)
          throw new Error(json.error || "Failed to fetch summary");
        setAssetCounts(json.byType);
        setStateCounts(json.byState);
        // Set new breakdowns
        setByTypeInBuilt(json.byTypeInBuilt || {});
        setByTypeInReadyToGo(json.byTypeInReadyToGo || {});
      } catch (err: unknown) {
        console.error("Error fetching summary:", err);
      }
    }
    fetchSummary();
  }, []);

  // Print handler (prints the chart and table)
  const handlePrint = () => {
    // Capture print time in British format
    setPrintTime(
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );
    setTimeout(() => {
      if (printRef.current) {
        window.print();
      }
    }, 100); // Give time for printTime to update
  };

  // Export handler: fetch PDF from API and trigger download
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Use the new pages/api route for PDF export
      const res = await fetch("/api/reports/pdf");
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "asset-inventory-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export PDF. Please try again.");
      console.error(err);
    } finally {
      setExportLoading(false);
    }
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
    <div style={{ padding: "1rem" }}>
      {/* Page Header - match Assets page */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Asset Inventory Report
        </h2>
        <p className="text-muted-foreground">Prepared on: {printTime || "—"}</p>
      </div>
      {/* Four charts/tables in a single horizontal row, using full page width */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2rem",
          marginTop: "2.5rem",
          marginBottom: "2.5rem",
          width: "100%",
          overflowX: "auto",
          justifyContent: "flex-start",
          boxSizing: "border-box",
        }}
      >
        {/* Assets by Type */}
        <div
          style={{
            flex: "1 1 0",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafbfc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Assets by Type
          </h2>
          <div
            className="print-chart"
            style={{ marginBottom: "1rem", width: "100%", height: "200px" }}
          >
            <Bar data={data} options={options} />
          </div>
          <div
            className="print-table"
            style={{ width: "100%", marginTop: "2rem" }}
          >
            {/* Font size reduced to match chart labels for compact layout */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 0,
                fontSize: "12px",
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
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      {type}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      {new Intl.NumberFormat().format(assetCounts[type])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Assets by State */}
        <div
          style={{
            flex: "1 1 0",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafbfc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Assets by State
          </h2>
          <div
            className="print-chart"
            style={{ marginBottom: "1rem", width: "100%", height: "200px" }}
          >
            <Bar data={stateData} options={stateOptions} />
          </div>
          <div
            className="print-table"
            style={{ width: "100%", marginTop: "2rem" }}
          >
            {/* Font size reduced to match chart labels for compact layout */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 0,
                fontSize: "12px",
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
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      {state}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      {new Intl.NumberFormat().format(stateCounts[state])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Assets in Build State */}
        <div
          style={{
            flex: "1 1 0",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafbfc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Assets in Build State
          </h2>
          <div
            className="print-chart"
            style={{ marginBottom: "1rem", width: "100%", height: "200px" }}
          >
            <Bar
              data={{
                labels: Object.keys(byTypeInBuilt).sort(),
                datasets: [
                  {
                    data: Object.keys(byTypeInBuilt)
                      .sort()
                      .map((type) => byTypeInBuilt[type]),
                    backgroundColor: Object.keys(byTypeInBuilt)
                      .sort()
                      .map((type) => {
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
              }}
              options={options}
            />
          </div>
          <div
            className="print-table"
            style={{ width: "100%", marginTop: "2rem" }}
          >
            {/* Font size reduced to match chart labels for compact layout */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 0,
                fontSize: "12px",
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
                {Object.keys(byTypeInBuilt)
                  .sort()
                  .map((type) => (
                    <tr key={type}>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                        }}
                      >
                        {type}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                        }}
                      >
                        {new Intl.NumberFormat().format(byTypeInBuilt[type])}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Assets Ready to Go */}
        <div
          style={{
            flex: "1 1 0",
            padding: "1rem",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafbfc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Assets Ready to Go
          </h2>
          <div
            className="print-chart"
            style={{ marginBottom: "1rem", width: "100%", height: "200px" }}
          >
            <Bar
              data={{
                labels: Object.keys(byTypeInReadyToGo).sort(),
                datasets: [
                  {
                    data: Object.keys(byTypeInReadyToGo)
                      .sort()
                      .map((type) => byTypeInReadyToGo[type]),
                    backgroundColor: Object.keys(byTypeInReadyToGo)
                      .sort()
                      .map((type) => {
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
              }}
              options={options}
            />
          </div>
          <div
            className="print-table"
            style={{ width: "100%", marginTop: "2rem" }}
          >
            {/* Font size reduced to match chart labels for compact layout */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 0,
                fontSize: "12px",
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
                {Object.keys(byTypeInReadyToGo)
                  .sort()
                  .map((type) => (
                    <tr key={type}>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                        }}
                      >
                        {type}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                        }}
                      >
                        {new Intl.NumberFormat().format(
                          byTypeInReadyToGo[type]
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Action buttons moved to bottom, left-aligned with title */}
      <div
        className="print-hide"
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: 6,
            border: "1px solid #2563EB",
            background: "#2563EB",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Print
        </button>
        {/* Export PDF functionality */}
        <button
          onClick={handleExport}
          disabled={exportLoading}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: 6,
            border: "1px solid #2563EB",
            background: exportLoading ? "#ccc" : "#2563EB",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
            cursor: exportLoading ? "not-allowed" : "pointer",
          }}
        >
          {exportLoading ? "Exporting..." : "Export"}
        </button>
      </div>
    </div>
  );
}

// Main Reports Page
export default function ReportsPage() {
  // Read the selected report from the query string (?report=CategoryName)
  const searchParams = useSearchParams();
  const reportParam = searchParams.get("report") || "";
  // Default to 'Asset Inventory' if not specified or invalid
  const selected = REPORTS.includes(reportParam) ? reportParam : REPORTS[0];

  // Render the selected report
  function renderReport() {
    if (selected === "Asset Inventory") return <AssetInventoryReport />;
    return <ReportPlaceholder title={selected} />;
  }

  return (
    <div style={{ padding: "1rem" }}>
      {/* Render selected report */}
      {renderReport()}
    </div>
  );
}
