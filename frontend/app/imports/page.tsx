// frontend/app/imports/page.tsx
"use client";
// Imports Page for bulk importing assets, users, and locations
// This page provides an 'Import Data' button to open the import modal dialog

import React, { useState } from "react";
// Import the ImportModal component (to be created)
import ImportModal from "@/components/imports/import-modal";
import { Button } from "@/components/ui/button";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { AssetState } from "@/lib/types";

// Main Imports Page component
const ImportsPage: React.FC = () => {
  // State to control modal visibility
  const [modalOpen, setModalOpen] = useState(false);
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

  // Handler to refresh data after successful import
  const handleImportSuccess = async () => {
    // Fetch the latest imported assets with status 'holding' from the backend
    try {
      const res = await fetch("/api/assets?status=holding&limit=20");
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
    const stateEnum = mapToAllowedStateEnum(row.state);
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
    // Use the same container classes as the assets page for left alignment and full width
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page title - match assets page style */}
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Bulk Import Data
      </h1>
      {/* Explanatory text - match assets page style */}
      <p className="text-muted-foreground mb-4">
        System Administrators can bulk import Assets, Users, or Locations using
        CSV or XLSX files. Imported assets will appear in the holding area until
        they are signed out and tagged.
      </p>
      {/* Import Data button */}
      <Button onClick={handleOpenModal} className="mb-8">
        Import Data
      </Button>
      {/* Import Modal (conditionally rendered) */}
      {modalOpen && (
        <ImportModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSuccess={async () => {
            handleCloseModal();
            await handleImportSuccess();
          }}
        />
      )}
      {/* Display imported data in a table if available */}
      {displayData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Recently Imported Data</h2>
          <div className="overflow-x-auto rounded-md border bg-white">
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
        </div>
      )}
    </div>
  );
};

export default ImportsPage;
