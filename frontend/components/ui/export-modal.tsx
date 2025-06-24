// frontend/components/ui/export-modal.tsx
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
 * ExportModal component for exporting table data as CSV or XLSX.
 * Props:
 * - open: boolean (modal open state)
 * - onOpenChange: (open: boolean) => void (modal open/close handler)
 * - onExport: (type: 'csv' | 'xlsx', scope: 'page' | 'all') => void (export handler)
 * - loading?: boolean (optional, disables buttons while loading)
 */
interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (type: "csv" | "xlsx", scope: "page" | "all") => void;
  loading?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onOpenChange,
  onExport,
  loading,
}) => {
  // State for radio selection: 'page' (default) or 'all'
  const [scope, setScope] = useState<"page" | "all">("page");

  // Reset scope when modal opens
  React.useEffect(() => {
    if (open) setScope("page");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="font-medium mb-2">Export scope:</div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="export-scope"
                value="page"
                checked={scope === "page"}
                onChange={() => setScope("page")}
                disabled={loading}
              />
              This page (currently visible data)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="export-scope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                disabled={loading}
              />
              All data (all filtered rows)
            </label>
          </div>
        </div>
        <DialogFooter className="w-full mt-4">
          <div className="w-full flex flex-row gap-4 justify-center">
            <Button onClick={() => onExport("xlsx", scope)} disabled={loading}>
              Export as Excel (.xlsx)
            </Button>
            <Button
              onClick={() => onExport("csv", scope)}
              disabled={loading}
              variant="outline"
            >
              Export as CSV
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
