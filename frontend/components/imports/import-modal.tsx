// frontend/components/imports/import-modal.tsx
// Modal dialog for importing assets, users, or locations in CSV/XLSX format
// Provides a step-by-step UI for selecting type, format, uploading file, and importing

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Define the importable data types
const DATA_TYPES = [
  { value: "assets", label: "Assets" },
  { value: "users", label: "Users" },
  { value: "locations", label: "Locations" },
];

// Define the supported file formats
const FILE_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "XLSX" },
];

// Toast component for feedback
function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded px-6 py-3 text-lg font-semibold shadow-lg transition-all
        ${
          type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}
      style={{ pointerEvents: "none" }}
    >
      {message}
    </div>
  );
}

// Props for the ImportModal
interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setErrorDetails: (details: string | null) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onClose,
  onSuccess,
  setErrorDetails,
}) => {
  // State for selected data type
  const [dataType, setDataType] = useState<string>(DATA_TYPES[0].value);
  // State for selected file format
  const [fileFormat, setFileFormat] = useState<string>(FILE_FORMATS[0].value);
  // State for selected file
  const [file, setFile] = useState<File | null>(null);
  // State for import feedback
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  // State for loading
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null); // Error visible inside modal
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setToast(null); // Clear toast on new file
    }
  };

  // Handler for import button click
  const handleImport = async () => {
    if (!file) {
      const msg = "Please select a file to import.";
      setToast({ message: msg, type: "error" });
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
      setErrorDetails(msg);
      setModalError(msg);
      return;
    }
    setLoading(true);
    setToast(null);
    setErrorDetails(null); // Clear previous error
    setModalError(null); // Clear previous modal error
    try {
      // Prepare form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", dataType);
      formData.append("format", fileFormat);
      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // Send POST request to backend import API
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        setToast({ message: "Import successful!", type: "success" });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
        setErrorDetails(null); // Clear error on success
        setModalError(null);
        setFile(null); // Reset file input
        onSuccess();
        onClose(); // Only close modal on success
      } else {
        let error = {} as Record<string, unknown>;
        let errorText = "";
        try {
          error = await res.json();
          errorText = JSON.stringify(error, null, 2);
        } catch {
          errorText = await res.text();
        }
        const msg = `Import failed. See error details below.\n${errorText}`;
        setToast({ message: msg, type: "error" });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
        setErrorDetails(msg);
        setModalError(msg);
        // Always log error
        console.error("Import error response:", errorText);
      }
    } catch {
      const msg = "An error occurred during import.";
      setToast({ message: msg, type: "error" });
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
      setErrorDetails(msg);
      setModalError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handler for closing the modal
  const handleClose = () => {
    setFile(null);
    setToast(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>
        {/* Step 1: Select data type */}
        <div className="mb-4">
          <div className="font-semibold mb-2">What do you want to import?</div>
          <div className="flex gap-4">
            {DATA_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name="dataType"
                  value={type.value}
                  checked={dataType === type.value}
                  onChange={() => setDataType(type.value)}
                />
                {type.label}
              </label>
            ))}
          </div>
        </div>
        {/* Step 2: Select file format */}
        <div className="mb-4">
          <div className="font-semibold mb-2">File format</div>
          <div className="flex gap-4">
            {FILE_FORMATS.map((fmt) => (
              <label
                key={fmt.value}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name="fileFormat"
                  value={fmt.value}
                  checked={fileFormat === fmt.value}
                  onChange={() => setFileFormat(fmt.value)}
                />
                {fmt.label}
              </label>
            ))}
          </div>
        </div>
        {/* Step 3: File upload */}
        <div className="mb-4">
          {/* Hidden file input and styled button */}
          <div className="flex items-center gap-2">
            <input
              id="import-file-input"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: "none" }}
            />
            <Button
              type="button"
              onClick={() =>
                document.getElementById("import-file-input")?.click()
              }
              disabled={loading}
            >
              Select file to import
            </Button>
            {/* Show selected file name */}
            {file && <span className="text-sm text-gray-700">{file.name}</span>}
          </div>
        </div>
        {/* Step 4: Import button */}
        <div className="flex gap-2 items-center">
          {modalError && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs whitespace-pre-wrap break-all">
              <strong>Error/Debug Info:</strong>
              <pre className="overflow-x-auto">{modalError}</pre>
            </div>
          )}
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Importing..." : "Import"}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </div>
        {/* Toast notification in the center of the modal */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
