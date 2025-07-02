// frontend/components/ui/export-modal.tsx
// PDF or CSV ExportModal for /users page
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

/**
 * ExportModal component for exporting table data as PDF or CSV (for /users page).
 * Props:
 * - open: boolean (modal open state)
 * - onOpenChange: (open: boolean) => void (modal open/close handler)
 * - onExport: (format: "pdf" | "csv") => void (export handler, receives selected format)
 * - loading?: boolean (optional, disables button while loading)
 */
interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "pdf" | "csv") => void;
  loading?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onOpenChange,
  onExport,
  loading,
}) => {
  // State for selected export format
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");

  // Handler for export button
  const handleExport = () => {
    onExport(format);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Users</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="font-medium mb-2">Export format:</div>
          <div className="flex flex-col gap-2">
            {/* Radio buttons for format selection */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="export-format"
                value="pdf"
                checked={format === "pdf"}
                onChange={() => setFormat("pdf")}
                disabled={loading}
              />
              PDF
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="export-format"
                value="csv"
                checked={format === "csv"}
                onChange={() => setFormat("csv")}
                disabled={loading}
              />
              CSV
            </label>
          </div>
        </div>
        <DialogFooter className="w-full mt-4">
          <div className="w-full flex flex-row gap-4 justify-center">
            <Button onClick={handleExport} disabled={loading}>
              Export as {format.toUpperCase()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
