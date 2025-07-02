/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// filepath: frontend/app/reports/page.tsx
// Main Reports Page for IT Asset Management System
// This file contains navigation and placeholders for all report types.
// Uses Chart.js for graphs (Asset Inventory as example).
// Includes Print, Email, Share, and Export buttons.

import React, { useState, useRef, useEffect, Suspense } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useSearchParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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
  const [byTypeInBuilding, setByTypeInBuilding] = useState<{
    [type: string]: number;
  }>({});
  const [byTypeInReadyToGo, setByTypeInReadyToGo] = useState<{
    [type: string]: number;
  }>({});
  // State for export loading
  const [exportLoading, setExportLoading] = useState(false);

  // Use generic refs for Bar charts to avoid type errors
  const chartTypeRef = useRef(null);
  const chartStateRef = useRef(null);
  const chartBuildingRef = useRef(null);
  const chartReadyRef = useRef(null);

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
        setByTypeInBuilding(json.byTypeInBuilding || {});
        setByTypeInReadyToGo(json.byTypeInReadyToGo || {});
      } catch (err: unknown) {
        console.error("Error fetching summary:", err);
      }
    }
    fetchSummary();
  }, []);

  // Export handler: get chart images and send to API
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Get chart images as data URLs
      const chart1 = (chartTypeRef as any).current?.toBase64Image() || "";
      const chart2 = (chartStateRef as any).current?.toBase64Image() || "";
      const chart3 = (chartBuildingRef as any).current?.toBase64Image() || "";
      const chart4 = (chartReadyRef as any).current?.toBase64Image() || "";
      // Send to API with real table data
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart1,
          chart2,
          chart3,
          chart4,
          assetTypes: Object.keys(assetCounts).sort(),
          assetCounts,
          stateTypes: Object.keys(stateCounts).sort(),
          stateCounts,
          buildingTypes: Object.keys(byTypeInBuilding).sort(),
          byTypeInBuilding,
          readyTypes: Object.keys(byTypeInReadyToGo).sort(),
          byTypeInReadyToGo,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      // Download the PDF as before
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
            case "BUILDING":
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

  // Prepare data for Assets in Building State
  const buildingLabels = Object.keys(byTypeInBuilding).sort();
  const buildingData = {
    labels: buildingLabels,
    datasets: [
      {
        data: buildingLabels.map((type) => byTypeInBuilding[type]),
        backgroundColor: buildingLabels.map((type) => {
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
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "2.5rem",
          marginBottom: "2.5rem",
          width: "100%",
          overflowX: "visible",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Assets by Type */}
        <Card
          style={{
            flex: "1 1 350px",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
            <CardTitle
              style={{
                fontSize: "1rem",
                textAlign: "center",
                whiteSpace: "normal",
                overflow: "visible",
                textOverflow: "unset",
                width: "100%",
              }}
            >
              Assets by Type
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 0.5rem 0.5rem 0.5rem",
            }}
          >
            <div
              className="print-chart"
              style={{
                marginBottom: "1rem",
                width: "350px",
                height: "200px",
                margin: "0 auto",
              }}
            >
              <Bar ref={chartTypeRef as any} data={data} options={options} />
            </div>
            <div
              className="print-table"
              style={{
                width: "100%",
                marginTop: "0.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1d4ed8",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopLeftRadius: "12px",
                      }}
                    >
                      Asset Type
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map((type, idx) => (
                    <tr
                      key={type}
                      style={{
                        transition: "background 0.2s",
                        borderBottom:
                          idx === labels.length - 1
                            ? "none"
                            : "1px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#f3f4f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "left",
                        }}
                      >
                        {type}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "right",
                        }}
                      >
                        {new Intl.NumberFormat().format(assetCounts[type])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Assets by State */}
        <Card
          style={{
            flex: "1 1 350px",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
            <CardTitle
              style={{
                fontSize: "1rem",
                textAlign: "center",
                whiteSpace: "normal",
                overflow: "visible",
                textOverflow: "unset",
                width: "100%",
              }}
            >
              Assets by State
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 0.5rem 0.5rem 0.5rem",
            }}
          >
            <div
              className="print-chart"
              style={{
                marginBottom: "1rem",
                width: "350px",
                height: "200px",
                margin: "0 auto",
              }}
            >
              <Bar
                ref={chartStateRef as any}
                data={stateData}
                options={stateOptions}
              />
            </div>
            <div
              className="print-table"
              style={{
                width: "100%",
                marginTop: "0.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1d4ed8",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopLeftRadius: "12px",
                      }}
                    >
                      Asset State
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stateLabels.map((state, idx) => (
                    <tr
                      key={state}
                      style={{
                        transition: "background 0.2s",
                        borderBottom:
                          idx === stateLabels.length - 1
                            ? "none"
                            : "1px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#f3f4f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "left",
                        }}
                      >
                        {state}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "right",
                        }}
                      >
                        {new Intl.NumberFormat().format(stateCounts[state])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Assets in Building State */}
        <Card
          style={{
            flex: "1 1 260px",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
            <CardTitle
              style={{
                fontSize: "1rem",
                textAlign: "center",
                whiteSpace: "normal",
                overflow: "visible",
                textOverflow: "unset",
                width: "100%",
              }}
            >
              Assets in Building State
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 0.5rem 0.5rem 0.5rem",
            }}
          >
            <div
              className="print-chart"
              style={{
                marginBottom: "1rem",
                width: "350px",
                height: "200px",
                margin: "0 auto",
              }}
            >
              <Bar
                ref={chartBuildingRef as any}
                data={buildingData}
                options={options}
              />
            </div>
            <div
              className="print-table"
              style={{
                width: "100%",
                marginTop: "0.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1d4ed8",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopLeftRadius: "12px",
                      }}
                    >
                      Asset Type
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buildingLabels.map((type, idx) => (
                    <tr
                      key={type}
                      style={{
                        transition: "background 0.2s",
                        borderBottom:
                          idx === buildingLabels.length - 1
                            ? "none"
                            : "1px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#f3f4f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "left",
                        }}
                      >
                        {type}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "right",
                        }}
                      >
                        {new Intl.NumberFormat().format(byTypeInBuilding[type])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Assets Ready to Go */}
        <Card
          style={{
            flex: "1 1 260px",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
            <CardTitle
              style={{
                fontSize: "1rem",
                textAlign: "center",
                whiteSpace: "normal",
                overflow: "visible",
                textOverflow: "unset",
                width: "100%",
              }}
            >
              Assets Ready to Go
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 0.5rem 0.5rem 0.5rem",
            }}
          >
            <div
              className="print-chart"
              style={{
                marginBottom: "1rem",
                width: "350px",
                height: "200px",
                margin: "0 auto",
              }}
            >
              <Bar
                ref={chartReadyRef as any}
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
              style={{
                width: "100%",
                marginTop: "0.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1d4ed8",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopLeftRadius: "12px",
                      }}
                    >
                      Asset Type
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(byTypeInReadyToGo)
                    .sort()
                    .map((type, idx, arr) => (
                      <tr
                        key={type}
                        style={{
                          transition: "background 0.2s",
                          borderBottom:
                            idx === arr.length - 1
                              ? "none"
                              : "1px solid #cbd5e1",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#f3f4f6")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            textAlign: "left",
                          }}
                        >
                          {type}
                        </td>
                        <td
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            textAlign: "right",
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
          </CardContent>
        </Card>
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
        {/* Export PDF functionality */}
        <button
          onClick={handleExport}
          disabled={exportLoading}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: 6,
            border: "1px solid #1d4ed8",
            background: exportLoading ? "#aaa" : "#1d4ed8",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
            cursor: exportLoading ? "not-allowed" : "pointer",
          }}
          aria-label="Export report as PDF"
          title="Export report as PDF"
        >
          {exportLoading ? "Exporting..." : "Export"}
        </button>
      </div>
    </div>
  );
}

// --- Lifecycle Management Report: Distribution of Assets by Year ---
function LifecycleManagementReport() {
  // State for year data
  const [yearCounts, setYearCounts] = React.useState<{
    [year: string]: number;
  }>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // Add printTime state for 'Prepared on' line (matches AssetInventoryReport)
  const [printTime, setPrintTime] = React.useState<string>("");
  React.useEffect(() => {
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

  // Fetch summary data (byYear) on mount
  React.useEffect(() => {
    async function fetchYearSummary() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports/asset-inventory/summary");
        const json = await res.json();
        if (!json.byYear) throw new Error(json.error || "No year data");
        setYearCounts(json.byYear);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchYearSummary();
  }, []);

  // Prepare data for the bar chart
  const years = Object.keys(yearCounts).sort();
  const data = {
    labels: years,
    datasets: [
      {
        label: "Assets",
        data: years.map((year) => yearCounts[year]),
        backgroundColor: "#2563EB",
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Distribution of Assets by Year" },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart" as const,
    },
    scales: {
      x: { title: { display: true, text: "Year" } },
      y: {
        title: { display: true, text: "Number of Assets" },
        beginAtZero: true,
      },
    },
  };

  // Render loading, error, or chart + table
  return (
    <div style={{ padding: "1rem" }}>
      {/* Page Header - match Asset Inventory page */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Lifecycle Management Report
        </h2>
        <p className="text-muted-foreground">Prepared on: {printTime || "—"}</p>
      </div>
      {loading ? (
        <div>Loading chart...</div>
      ) : error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : (
        <Card
          style={{
            flex: "1 1 350px",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "2.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
            <CardTitle
              style={{
                fontSize: "1rem",
                textAlign: "center",
                whiteSpace: "normal",
                overflow: "visible",
                textOverflow: "unset",
                width: "100%",
              }}
            >
              Assets by Year
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 0.5rem 0.5rem 0.5rem",
            }}
          >
            <div
              style={{
                width: "100%",
                margin: 0,
                marginBottom: "1rem",
                height: 200,
              }}
            >
              <Bar
                data={data}
                options={{
                  ...options,
                  plugins: { ...options.plugins, title: { display: false } },
                  scales: {
                    ...options.scales,
                    x: { ...options.scales.x, title: { display: false } },
                    y: { ...options.scales.y, title: { display: false } },
                  },
                }}
              />
            </div>
            <div style={{ width: "100%", marginTop: "2rem" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1d4ed8",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopLeftRadius: "12px",
                      }}
                    >
                      Year
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((year, idx) => (
                    <tr
                      key={year}
                      style={{
                        transition: "background 0.2s",
                        borderBottom:
                          idx === years.length - 1
                            ? "none"
                            : "1px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#f3f4f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "left",
                        }}
                      >
                        {year}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          textAlign: "right",
                        }}
                      >
                        {new Intl.NumberFormat().format(yearCounts[year])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Financial Report: Asset Value by Type and Over Years ---
function FinancialReport() {
  // State for API data
  const [byType, setByType] = useState<{ [type: string]: number }>({});
  const [byYear, setByYear] = useState<{ [year: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Print time for header
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
  // Fetch summary data
  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports/financial/summary");
        const json = await res.json();
        if (!json.byType || !json.byYear)
          throw new Error(json.error || "No data");
        setByType(json.byType);
        setByYear(json.byYear);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);
  // Prepare data for bar chart (value by type)
  const typeLabels = Object.keys(byType).sort();
  const barData = {
    labels: typeLabels,
    datasets: [
      {
        label: "Current Value (£)",
        data: typeLabels.map((type) => byType[type]),
        backgroundColor: typeLabels.map((type) => {
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
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `£${ctx.parsed.y.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" as const },
    scales: { y: { beginAtZero: true } },
  };
  // Prepare data for line chart (value over years)
  const yearLabels = Object.keys(byYear).sort();
  const lineData = {
    labels: yearLabels,
    datasets: [
      {
        label: "Total Value (£)",
        data: yearLabels.map((year) => byYear[year]),
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,0.2)",
        fill: true,
        tension: 0.2,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `£${ctx.parsed.y.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" as const },
    scales: { y: { beginAtZero: true } },
  };
  // Render loading, error, or charts
  return (
    <div style={{ padding: "1rem" }}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Report</h2>
        <p className="text-muted-foreground">Prepared on: {printTime || "—"}</p>
      </div>
      {loading ? (
        <div>Loading financial data...</div>
      ) : error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            marginTop: "2.5rem",
            marginBottom: "2.5rem",
            width: "auto",
            overflowX: "auto",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          {/* Bar Chart: Value by Type */}
          <Card
            style={{
              flex: "1 1 350px",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
              <CardTitle
                style={{
                  fontSize: "1rem",
                  textAlign: "center",
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "unset",
                  width: "100%",
                }}
              >
                Current Value of Assets
              </CardTitle>
            </CardHeader>
            <CardContent
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0 0.5rem 0.5rem 0.5rem",
              }}
            >
              <div
                style={{
                  marginBottom: "1rem",
                  width: "350px",
                  height: "200px",
                  margin: "0 auto",
                }}
              >
                <Bar data={barData} options={barOptions} />
              </div>
              {/* Table of values */}
              <div style={{ width: "100%", marginTop: "2rem" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    borderRadius: "0 0 12px 12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#1d4ed8",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      <th
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          borderTopLeftRadius: "12px",
                        }}
                      >
                        Asset Type
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          borderTopRightRadius: "12px",
                        }}
                      >
                        Current Value (£)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeLabels.map((type, idx) => (
                      <tr
                        key={type}
                        style={{
                          transition: "background 0.2s",
                          borderBottom:
                            idx === typeLabels.length - 1
                              ? "none"
                              : "1px solid #cbd5e1",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#f3f4f6")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            textAlign: "left",
                          }}
                        >
                          {type}
                        </td>
                        <td
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            textAlign: "right",
                          }}
                        >
                          {byType[type].toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Line Chart: Value over Years */}
          <Card
            style={{
              flex: "1 1 350px",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CardHeader style={{ padding: "0.5rem 0 0 0", width: "100%" }}>
              <CardTitle
                style={{
                  fontSize: "1rem",
                  textAlign: "center",
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "unset",
                  width: "100%",
                }}
              >
                Asset Value Over Years
              </CardTitle>
            </CardHeader>
            <CardContent
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0 0.5rem 0.5rem 0.5rem",
              }}
            >
              <div
                style={{
                  marginBottom: "1rem",
                  width: "350px",
                  height: "200px",
                  margin: "0 auto",
                }}
              >
                <Line data={lineData} options={lineOptions} />
              </div>
              {/* Table of values */}
              <div style={{ width: "100%", marginTop: "2rem" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    borderRadius: "0 0 12px 12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#1d4ed8",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      <th
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          borderTopLeftRadius: "12px",
                        }}
                      >
                        Year
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          borderTopRightRadius: "12px",
                        }}
                      >
                        Total Value (£)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearLabels.map((year, idx) => (
                      <tr
                        key={year}
                        style={{
                          transition: "background 0.2s",
                          borderBottom:
                            idx === yearLabels.length - 1
                              ? "none"
                              : "1px solid #cbd5e1",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#f3f4f6")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            textAlign: "left",
                          }}
                        >
                          {year}
                        </td>
                        <td
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            textAlign: "right",
                          }}
                        >
                          {byYear[year].toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Main Reports Page
function ReportsPageContent() {
  // Read the selected report from the query string (?report=CategoryName)
  const searchParams = useSearchParams();
  // Use optional chaining to avoid errors if searchParams is null
  const reportParam = searchParams?.get("report") || "";
  // Default to 'Asset Inventory' if not specified or invalid
  const selected = REPORTS.includes(reportParam) ? reportParam : REPORTS[0];

  // Render the selected report
  function renderReport() {
    if (selected === "Asset Inventory") return <AssetInventoryReport />;
    if (selected === "Lifecycle Management")
      return <LifecycleManagementReport />;
    if (selected === "Financial") return <FinancialReport />;
    return <ReportPlaceholder title={selected} />;
  }

  return (
    <div style={{ padding: "1rem" }}>
      {/* Render selected report */}
      {renderReport()}
    </div>
  );
}

// Wrap in Suspense to satisfy Next.js requirements for useSearchParams
export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading report...</div>}>
      <ReportsPageContent />
    </Suspense>
  );
}
