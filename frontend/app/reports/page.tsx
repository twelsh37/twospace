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
import { ReportCard } from "@/components/ui/report-card";

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

  // Render loading, error, or charts
  return (
    <div className="flex-1 flex flex-col pt-4 md:pt-6 pb-2 md:pb-4 px-4 md:px-8">
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
        className="shadow-lg border"
      >
        <CardHeader className="pb-2">
          <CardTitle
            style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
          >
            Asset Inventory Report
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Prepared on: {printTime || "—"}
          </p>
        </CardHeader>
        <CardContent>
          {/* Responsive grid for chart+table cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard title="Assets by Type" date={printTime || "—"}>
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Bar
                    ref={chartTypeRef as any}
                    data={data}
                    options={options}
                  />
                </div>
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Asset Type
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                            background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                            transition: "background 0.2s",
                            borderBottom:
                              idx === labels.length - 1
                                ? "none"
                                : "1px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#e0e7ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                              fontFamily:
                                'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
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
            </ReportCard>
            <ReportCard title="Assets by State" date={printTime || "—"}>
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Bar
                    ref={chartStateRef as any}
                    data={stateData}
                    options={stateOptions}
                  />
                </div>
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Asset State
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                            background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                            transition: "background 0.2s",
                            borderBottom:
                              idx === stateLabels.length - 1
                                ? "none"
                                : "1px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#e0e7ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                              fontFamily:
                                'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
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
            </ReportCard>
            <ReportCard
              title="Assets in Building State"
              date={printTime || "—"}
            >
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Bar
                    ref={chartBuildingRef as any}
                    data={buildingData}
                    options={options}
                  />
                </div>
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Asset Type
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                            background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                            transition: "background 0.2s",
                            borderBottom:
                              idx === buildingLabels.length - 1
                                ? "none"
                                : "1px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#e0e7ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                              fontFamily:
                                'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
                            }}
                          >
                            {new Intl.NumberFormat().format(
                              byTypeInBuilding[type]
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportCard>
            <ReportCard title="Assets Ready to Go" date={printTime || "—"}>
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
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
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Asset Type
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                              background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                              transition: "background 0.2s",
                              borderBottom:
                                idx === arr.length - 1
                                  ? "none"
                                  : "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.background = "#e0e7ff")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.background =
                                idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                                fontFamily:
                                  'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
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
            </ReportCard>
          </div>
        </CardContent>
      </Card>
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
  if (loading) return <div>Loading chart...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="flex-1 flex flex-col pt-4 md:pt-6 pb-2 md:pb-4 px-4 md:px-8">
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
        className="shadow-lg border"
      >
        <CardHeader className="pb-2">
          <CardTitle
            style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
          >
            Lifecycle Management Report
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Prepared on: {printTime || "—"}
          </p>
        </CardHeader>
        <CardContent>
          {/* Responsive grid for chart+table cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Bar Chart + Table */}
            <ReportCard title="Assets by Year" date={printTime || "—"}>
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Bar data={data} options={options} />
                </div>
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Year
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                            background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                            transition: "background 0.2s",
                            borderBottom:
                              idx === years.length - 1
                                ? "none"
                                : "1px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#e0e7ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                              fontFamily:
                                'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
                            }}
                          >
                            {new Intl.NumberFormat().format(yearCounts[year])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportCard>
          </div>
        </CardContent>
      </Card>
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
  if (loading) return <div>Loading financial data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="flex-1 flex flex-col pt-4 md:pt-6 pb-2 md:pb-4 px-4 md:px-8">
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
        className="shadow-lg border"
      >
        <CardHeader className="pb-2">
          <CardTitle
            style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
          >
            Financial Report
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Prepared on: {printTime || "—"}
          </p>
        </CardHeader>
        <CardContent>
          {/* Responsive grid for chart+table cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Bar Chart + Value Table */}
            <ReportCard
              title="Current Value by Asset Type"
              date={printTime || "—"}
            >
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Bar data={barData} options={barOptions} />
                </div>
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Asset Type
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                            background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                            transition: "background 0.2s",
                            borderBottom:
                              idx === typeLabels.length - 1
                                ? "none"
                                : "1px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#e0e7ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                              fontFamily:
                                'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
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
              </div>
            </ReportCard>
            {/* Card 2: Line Chart + Yearly Value Table */}
            <ReportCard title="Asset Value Over Years" date={printTime || "—"}>
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Line data={lineData} options={lineOptions} />
                </div>
                <div className="w-full overflow-x-auto">
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
                            textAlign: "left",
                          }}
                        >
                          Year
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                            border: "none",
                            borderTopRightRadius: "12px",
                            textAlign: "right",
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
                            background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                            transition: "background 0.2s",
                            borderBottom:
                              idx === yearLabels.length - 1
                                ? "none"
                                : "1px solid #cbd5e1",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#e0e7ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background =
                              idx % 2 === 0 ? "#f8fafc" : "#fff")
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
                              fontFamily:
                                'Consolas, "Liberation Mono", Menlo, Monaco, "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace, sans-serif',
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
              </div>
            </ReportCard>
          </div>
        </CardContent>
      </Card>
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
