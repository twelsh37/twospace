// frontend/app/imports/page.tsx
"use client";
// Imports Page for bulk importing assets, users, and locations
// This page provides an 'Import Data' button to open the import modal dialog

import React, { useState, useEffect } from "react";
// Import the ImportModal component (to be created)
import ImportModal from "@/components/imports/import-modal";
import { Button } from "@/components/ui/button";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { AssetState } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import HoldingAssetsTable from "@/components/holding-assets/HoldingAssetsTable";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { supabase } from "@/lib/supabase";

// Main Imports Page component
const ImportsPage: React.FC = () => {
  // State to control modal visibility
  const [modalOpen, setModalOpen] = useState(false);
  const [holdingModalOpen, setHoldingModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null); // Persistent error area
  const [hasUnassignedAssets, setHasUnassignedAssets] = useState(false); // Track if there are unassigned assets
  // State to store imported data for display
  // The imported data is an array of objects, where each object represents a row from the imported CSV/XLSX file.
  // The keys are column names and the values are dynamic (string, number, boolean, etc.), so we use Record<string, unknown> for type safety.
  const [importedData, setImportedData] = useState<Record<string, unknown>[]>(
    []
  );

  // Handler to open the modal
  const handleOpenModal = () => setModalOpen(true);
  // Handler to close the modal
  const handleCloseModal = () => setModalOpen(false);

  // Fetch count of unassigned assets
  const fetchUnassignedAssets = async () => {
    try {
      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/holding-assets", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();
      setHasUnassignedAssets(
        Array.isArray(data?.data?.assets) && data.data.assets.length > 0
      );
    } catch {
      setHasUnassignedAssets(false);
    }
  };

  // Fetch on page load
  useEffect(() => {
    fetchUnassignedAssets();
  }, []);

  // Handler to refresh data after successful import
  const handleImportSuccess = async () => {
    await fetchUnassignedAssets();
    // Fetch the latest imported assets with status 'holding' from the backend
    try {
      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/assets?status=holding&limit=20", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setImportedData(data.data.assets || []);
      } else {
        setImportedData([]);
      }
    } catch {
      setImportedData([]);
    }
  };

  // Define the columns to display and their headers
  const columns = [
    { key: "assetNumber", label: "Asset Number" },
    { key: "type", label: "Type" },
    { key: "state", label: "State" },
    { key: "assignmentType", label: "Assignment Type" },
    { key: "serialNumber", label: "Serial Number" },
    { key: "description", label: "Description" },
    { key: "purchasePrice", label: "Purchase Price" },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
  ];

  // Helper to format purchase price as currency
  function formatCurrency(value: unknown) {
    if (typeof value === "number") {
      return value.toLocaleString("en-GB", {
        style: "currency",
        currency: "GBP",
      });
    }
    if (typeof value === "string" && !isNaN(Number(value))) {
      return Number(value).toLocaleString("en-GB", {
        style: "currency",
        currency: "GBP",
      });
    }
    return value || "";
  }

  // Helper to map imported state to allowed AssetState enum
  function mapToAllowedStateEnum(importedState: unknown): AssetState {
    // Try to match by display label (case-insensitive)
    if (typeof importedState === "string") {
      const found = Object.entries(ASSET_STATE_LABELS).find(
        ([, label]) => label.toLowerCase() === importedState.toLowerCase()
      );
      if (found) return found[0] as AssetState;
      // Try to match by enum value
      if (Object.values(AssetState).includes(importedState as AssetState)) {
        return importedState as AssetState;
      }
    }
    // Default to AVAILABLE
    return AssetState.AVAILABLE;
  }

  // Map imported data to only include the required columns and override assignmentType/location
  const displayData: Record<string, string>[] = importedData.map((row) => {
    // If status is HOLDING, show as Holding (Imported)
    const isHolding = String(row.status).toUpperCase() === "HOLDING";
    const stateEnum = isHolding
      ? AssetState.HOLDING
      : mapToAllowedStateEnum(row.state);
    return {
      assetNumber: String(row.assetNumber || ""),
      type: String(row.type || ""),
      state: ASSET_STATE_LABELS[stateEnum],
      assignmentType: "Unassigned", // Always show Unassigned for imported assets
      serialNumber: String(row.serialNumber || ""),
      description: String(row.description || ""),
      purchasePrice: String(formatCurrency(row.purchasePrice)),
      status: String(row.status || ""),
      location: "IT Department - Store room", // Always show this for imported assets
    };
  });

  return (
    <ErrorBoundary>
      {/* Only ADMIN users can access this page */}
      <ProtectedRoute requireAdmin={true}>
        <div className="flex min-h-[80vh] items-center justify-center p-4">
          <Card className="w-full max-w-md md:max-w-2xl shadow-lg border rounded-xl">
            <CardContent className="py-8 flex flex-col items-center">
              {/* Page title - match assets page style */}
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">
                Bulk Import Data
              </h1>
              {/* Explanatory text - match assets page style */}
              <p className="text-muted-foreground mb-6 text-center">
                System Administrators can bulk import Assets, Users, or
                Locations using CSV or XLSX files. Imported assets will appear
                in the holding area until they are signed out and tagged.
              </p>
              {/* Import Data button */}
              <Button
                onClick={handleOpenModal}
                className="mb-4 w-full max-w-xs"
              >
                Import Data
              </Button>
              {/* Persistent error area for easier copying */}
              {errorDetails && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-xs whitespace-pre-wrap break-all w-full">
                  <strong>Error Details:</strong>
                  <pre className="overflow-x-auto">{errorDetails}</pre>
                </div>
              )}
              {/* View Holding Assets button */}
              <Button
                onClick={() => setHoldingModalOpen(true)}
                className={`mb-4 w-full max-w-xs ${
                  hasUnassignedAssets
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : ""
                }`}
                variant={hasUnassignedAssets ? undefined : "secondary"}
              >
                View Holding Assets
              </Button>
              {/* Import Modal (conditionally rendered) */}
              {modalOpen && (
                <>
                  {console.log("[DEBUG] Rendering ImportModal", { modalOpen })}
                  <ImportModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    onSuccess={async () => {
                      handleCloseModal();
                      await handleImportSuccess();
                    }}
                    setErrorDetails={setErrorDetails}
                  />
                </>
              )}
              {/* Holding Assets Modal (flyout) */}
              {holdingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
                    <HoldingAssetsTable />
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={() => setHoldingModalOpen(false)}
                        variant="secondary"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {/* Display imported data in a table if available */}
              {displayData.length > 0 && (
                <div className="mt-8 w-full overflow-x-auto rounded-md border bg-white">
                  <h2 className="text-lg font-semibold mb-2 text-center">
                    Recently Imported Data
                  </h2>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className="border-b px-4 py-2 text-left font-medium bg-gray-50"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.map((row, idx) => (
                        <tr key={idx} className="even:bg-gray-50">
                          {columns.map((col) => (
                            <td key={col.key} className="px-4 py-2 border-b">
                              {row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
};

export default ImportsPage;
