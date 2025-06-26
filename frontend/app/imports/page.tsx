// frontend/app/imports/page.tsx
"use client";
// Imports Page for bulk importing assets, users, and locations
// This page provides an 'Import Data' button to open the import modal dialog

import React, { useState } from "react";
// Import the ImportModal component (to be created)
import ImportModal from "@/components/imports/import-modal";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-6">Bulk Import Data</h1>
      {/* Explanatory text */}
      <p className="mb-4 text-gray-600">
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
      {importedData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Recently Imported Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  {Object.keys(importedData[0]).map((key) => (
                    <th
                      key={key}
                      className="border px-2 py-1 bg-gray-100 text-left"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="border px-2 py-1">
                        {val as string}
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
