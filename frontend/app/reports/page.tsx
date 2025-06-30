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

// Helper to get color for each asset type (same as dashboard)
function getTypeColor(type: string): string {
  switch (type) {
    case "LAPTOP":
      return "#3B82F6"; // blue-500
    case "MONITOR":
      return "#22C55E"; // green-500
    case "MOBILE_PHONE":
      return "#A21CAF"; // purple-500
    case "DESKTOP":
      return "#F59E42"; // orange-500
    case "TABLET":
      return "#EC4899"; // pink-500
    default:
      return "#6B7280"; // gray-500
  }
}

// Helper to get color for each asset state (hex values for Chart.js)
function getStateColor(state: string): string {
  switch (state) {
    case "AVAILABLE":
      return "#2563EB"; // blue-600
    case "SIGNED_OUT":
      return "#14B8A6"; // teal-600
    case "BUILT":
      return "#F59E42"; // orange-500
    case "READY_TO_GO":
      return "#7C3AED"; // purple-600
    case "ISSUED":
      return "#22C55E"; // green-600
    default:
      return "#6B7280"; // gray-400
  }
}

// Asset type for API data (fallback to string for unknown types)
type AssetTypeString = string;
interface AssetAPI {
  type: AssetTypeString;
  state: string; // Add state for grouping by state
  // ...other fields not used here
}

// Asset Inventory Report with live data and background loading for large datasets
function AssetInventoryReport() {
  // Ref for print functionality
  const printRef = useRef<HTMLDivElement>(null);
  // State for asset data
  const [assetCounts, setAssetCounts] = useState<{ [type: string]: number }>(
    {}
  );
  const [stateCounts, setStateCounts] = useState<{ [state: string]: number }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  // Helper to group assets by type
  function groupByType(assets: AssetAPI[]): { [type: string]: number } {
    const counts: { [type: string]: number } = {};
    for (const asset of assets) {
      counts[asset.type] = (counts[asset.type] || 0) + 1;
    }
    return counts;
  }

  // Group assets by state
  function groupByState(assets: AssetAPI[]): { [state: string]: number } {
    const counts: { [state: string]: number } = {};
    for (const asset of assets) {
      counts[asset.state] = (counts[asset.state] || 0) + 1;
    }
    return counts;
  }

  // Fetch all assets in batches if needed
  useEffect(() => {
    let isMounted = true;
    async function fetchAllAssets() {
      setLoading(true);
      setError(null);
      try {
        const limit = 1000;
        let allAssets: AssetAPI[] = [];
        // Fetch first batch
        const res = await fetch(`/api/assets?limit=${limit}&page=1`);
        const json = await res.json();
        if (!json.success)
          throw new Error(json.error || "Failed to fetch assets");
        allAssets = json.data.assets;
        const { totalAssets, totalPages } = json.data.pagination;
        // Update chart/table with first batch
        if (isMounted) {
          setAssetCounts(groupByType(allAssets));
          setStateCounts(groupByState(allAssets));
        }
        // If more assets, fetch in background
        if (totalAssets > limit) {
          setBackgroundLoading(true);
          const fetchPromises = [];
          for (let p = 2; p <= totalPages; p++) {
            fetchPromises.push(
              fetch(`/api/assets?limit=${limit}&page=${p}`)
                .then((r) => r.json())
                .then((j) => {
                  if (j.success) {
                    allAssets = allAssets.concat(j.data.assets as AssetAPI[]);
                    if (isMounted) {
                      setAssetCounts(groupByType(allAssets));
                      setStateCounts(groupByState(allAssets));
                    }
                  }
                })
            );
          }
          await Promise.all(fetchPromises);
          setBackgroundLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAllAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Prepare data for Chart.js
  const labels = Object.keys(assetCounts);
  const sortedLabels = [...labels].sort(); // Ensure a new sorted array
  const data = {
    labels: sortedLabels,
    datasets: [
      {
        data: sortedLabels.map((type) => assetCounts[type]),
        backgroundColor: sortedLabels.map((type) => getTypeColor(type)), // Use type colors
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hide legend since each bar is labeled
      title: { display: false }, // Remove chart title
    },
  };

  // Prepare data for Chart.js (by state)
  const stateLabels = Object.keys(stateCounts);
  const sortedStateLabels = [...stateLabels].sort();
  const stateData = {
    labels: sortedStateLabels,
    datasets: [
      {
        data: sortedStateLabels.map((state) => stateCounts[state]),
        backgroundColor: sortedStateLabels.map((state) => getStateColor(state)),
      },
    ],
  };
  const stateOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  // Print handler
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open("", "", "width=900,height=700");
      if (win) {
        win.document.write(
          "<html><head><title>Print Report</title></head><body>" +
            printContents +
            "</body></html>"
        );
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div>
      {/* Action buttons */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
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
        <div ref={printRef}>
          <h2 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
            Asset Inventory Report
          </h2>
          <Bar data={data} options={options} />
          <table
            style={{
              width: "100%",
              marginTop: "2rem",
              borderCollapse: "collapse",
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
                  {/* Format count with thousandths separators */}
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    {new Intl.NumberFormat().format(assetCounts[type])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Chart and table by state */}
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              marginTop: "3rem",
            }}
          >
            Assets by State
          </h2>
          <Bar data={stateData} options={stateOptions} />
          <table
            style={{
              width: "100%",
              marginTop: "2rem",
              borderCollapse: "collapse",
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
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    {state}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    {new Intl.NumberFormat().format(stateCounts[state])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Show background loading if more data is being fetched */}
      {backgroundLoading && <p>Loading more assets in the background...</p>}
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
