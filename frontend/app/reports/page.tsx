// frontend/app/reports/page.tsx
// Reports management page

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

"use client";

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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ExportModal } from "@/components/ui/export-modal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/lib/auth-context";

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

// 1. Add types for chart refs and data
interface AssetInventoryExportData {
  chart1?: string; // Assets by Type
  chart2?: string; // Assets by State
  chart3?: string; // Assets in Building State
  chart4?: string; // Assets Ready to Go
  assetTypes: string[];
  assetCounts: Record<string, number>;
  stateTypes: string[];
  stateCounts: Record<string, number>;
  buildingTypes: string[];
  byTypeInBuilding: Record<string, number>;
  readyTypes: string[];
  byTypeInReadyToGo: Record<string, number>;
}

// 2. In ReportsPageContent, add state to hold export data
// const [assetInventoryExportData, setAssetInventoryExportData] =
//   useState<AssetInventoryExportData | null>(null);

// 3. Update AssetInventoryReport to accept a setExportData prop
function AssetInventoryReport({
  onExport,
}: {
  onExport: (data: AssetInventoryExportData) => void;
}) {
  // Get authentication context
  const { session } = useAuth();

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
        // Add authorization header if session exists
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/reports/asset-inventory/summary", {
          headers,
        });
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

    // Only fetch if we have a session
    if (session) {
      fetchSummary();
    }
  }, [session]);

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

  // Function to gather export data on demand
  function getExportData(): AssetInventoryExportData {
    const chart1 =
      (
        chartTypeRef.current as unknown as { toBase64Image?: () => string }
      )?.toBase64Image?.() || undefined;
    const chart2 =
      (
        chartStateRef.current as unknown as { toBase64Image?: () => string }
      )?.toBase64Image?.() || undefined;
    const chart3 =
      (
        chartBuildingRef.current as unknown as { toBase64Image?: () => string }
      )?.toBase64Image?.() || undefined;
    const chart4 =
      (
        chartReadyRef.current as unknown as { toBase64Image?: () => string }
      )?.toBase64Image?.() || undefined;
    return {
      chart1,
      chart2,
      chart3,
      chart4,
      assetTypes: labels,
      assetCounts,
      stateTypes: stateLabels,
      stateCounts,
      buildingTypes: buildingLabels,
      byTypeInBuilding,
      readyTypes: Object.keys(byTypeInReadyToGo).sort(),
      byTypeInReadyToGo,
    };
  }

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
        <CardHeader className="pb-2 flex flex-row items-center">
          <div className="flex-1">
            <CardTitle
              style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
            >
              Asset Inventory Report
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Prepared on: {printTime || "—"}
            </p>
          </div>
          {/* Export button for Asset Inventory */}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-1"
            onClick={() => onExport(getExportData())}
            title={`Export Asset Inventory report`}
            style={{ marginLeft: "auto" }}
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {/* Responsive grid for chart+table cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard title="Assets by Type" date={printTime || "—"}>
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Bar
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
function LifecycleManagementReport({ onExport }: { onExport: () => void }) {
  // Get authentication context
  const { session } = useAuth();

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
        // Add authorization header if session exists
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/reports/asset-inventory/summary", {
          headers,
        });
        const json = await res.json();
        if (!json.byYear) throw new Error(json.error || "No year data");
        setYearCounts(json.byYear);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if we have a session
    if (session) {
      fetchYearSummary();
    }
  }, [session]);

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
        <CardHeader className="pb-2 flex flex-row items-center">
          <div className="flex-1">
            <CardTitle
              style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
            >
              Lifecycle Management Report
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Prepared on: {printTime || "—"}
            </p>
          </div>
          {/* Export button for Lifecycle Management */}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-1"
            onClick={onExport}
            title={`Export Lifecycle Management report`}
            style={{ marginLeft: "auto" }}
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
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
function FinancialReport({ onExport }: { onExport: () => void }) {
  // Get authentication context
  const { session } = useAuth();

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
        // Add authorization header if session exists
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/reports/financial/summary", { headers });
        const json = await res.json();
        if (!json.byType || !json.byYear)
          throw new Error(json.error || "No data");
        setByType(json.byType);
        setByYear(json.byYear);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if we have a session
    if (session) {
      fetchSummary();
    }
  }, [session]);
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
          label: (ctx: { parsed: { y: number } }) =>
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
          label: (ctx: { parsed: { y: number } }) =>
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
        <CardHeader className="pb-2 flex flex-row items-center">
          <div className="flex-1">
            <CardTitle
              style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
            >
              Financial Report
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Prepared on: {printTime || "—"}
            </p>
          </div>
          {/* Export button for Financial */}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-1"
            onClick={onExport}
            title={`Export Financial report`}
            style={{ marginLeft: "auto" }}
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
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

// Placeholder component for each report type
function ReportPlaceholder({
  title,
  onExport,
}: {
  title: string;
  onExport: () => void;
}) {
  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}
      >
        <h2 style={{ fontWeight: "bold", fontSize: "1.5rem", flex: 1 }}>
          {title} Report
        </h2>
        {/* Export button for placeholder reports */}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex items-center gap-1"
          onClick={onExport}
          title={`Export ${title} report`}
          style={{ marginLeft: "auto" }}
        >
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
      </div>
      <p>
        Coming soon: Detailed {title.toLowerCase()} report with tables, charts,
        and export options.
      </p>
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

  // State for export modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportReport, setExportReport] = useState<string>(selected);

  // Move useState inside the component
  const [assetInventoryExportData, setAssetInventoryExportData] =
    useState<AssetInventoryExportData | null>(null);

  // Handler to open export modal for a report
  function handleOpenExport(reportName: string) {
    setExportReport(reportName);
    setExportModalOpen(true);
  }

  // Handler to actually export the report as PDF
  async function handleExport(format: "pdf" | "csv") {
    setExportLoading(true);
    try {
      let apiUrl = "";
      let body: Record<string, unknown> = { format };
      let filename = format === "pdf" ? "report.pdf" : "report.csv";
      
      if (exportReport === "Asset Inventory") {
        apiUrl = format === "pdf" ? "/api/reports/pdf" : "/api/reports/export";
        filename = format === "pdf" ? "asset-inventory-report.pdf" : "asset-inventory-report.csv";
        // Attach chart images and table data
        if (assetInventoryExportData) {
          body = { ...assetInventoryExportData, format };
        }
      } else if (exportReport === "Lifecycle Management") {
        alert(`${format.toUpperCase()} export for Lifecycle Management is not yet implemented.`);
        setExportLoading(false);
        setExportModalOpen(false);
        return;
      } else if (exportReport === "Financial") {
        alert(`${format.toUpperCase()} export for Financial is not yet implemented.`);
        setExportLoading(false);
        setExportModalOpen(false);
        return;
      } else {
        alert(`${format.toUpperCase()} export for ${exportReport} is not yet implemented.`);
        setExportLoading(false);
        setExportModalOpen(false);
        return;
      }
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to export ${format.toUpperCase()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        `Failed to export ${exportReport} as ${format.toUpperCase()}. Please try again.\n` +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setExportLoading(false);
      setExportModalOpen(false);
    }
  }

  // Render the selected report, passing export handler
  function renderReport() {
    // Pass export handler to each report for the export button
    if (selected === "Asset Inventory")
      return (
        <AssetInventoryReport
          onExport={(data) => {
            setAssetInventoryExportData(data);
            handleOpenExport("Asset Inventory");
          }}
        />
      );
    if (selected === "Lifecycle Management")
      return (
        <LifecycleManagementReport
          onExport={() => handleOpenExport("Lifecycle Management")}
        />
      );
    if (selected === "Financial")
      return <FinancialReport onExport={() => handleOpenExport("Financial")} />;
    return (
      <ReportPlaceholder
        title={selected}
        onExport={() => handleOpenExport(selected)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ padding: "1rem" }}>
        {/* Render selected report */}
        {renderReport()}
        {/* Export Modal for all reports */}
        <ExportModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          onExport={handleExport}
          loading={exportLoading}
          title={`Export ${exportReport} Report`}
        />
      </div>
    </ErrorBoundary>
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
