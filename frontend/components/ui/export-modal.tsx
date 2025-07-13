// frontend/components/ui/export-modal.tsx
// PDF or CSV ExportModal for /users page
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

/**
 * ExportModal component for exporting table data as PDF only (for reports).
 * Props:
 * - open: boolean (modal open state)
 * - onOpenChange: (open: boolean) => void (modal open/close handler)
 * - onExport: (format: "pdf") => void (export handler, receives selected format)
 * - loading?: boolean (optional, disables button while loading)
 * - title?: string (optional, modal title)
 */
interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "pdf") => void;
  loading?: boolean;
  title?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onOpenChange,
  onExport,
  loading,
  title = "Export Report",
}) => {
  // Only PDF export is allowed for reports
  const format = "pdf";

  // Handler for export button
  const handleExport = () => {
    onExport(format);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="font-medium mb-2">Export format:</div>
          <div className="flex flex-col gap-2">
            {/* Only PDF option is available */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="export-format"
                value="pdf"
                checked
                readOnly
                disabled
              />
              PDF
            </label>
          </div>
        </div>
        <DialogFooter className="w-full mt-4">
          <div className="w-full flex flex-row gap-4 justify-center">
            <Button onClick={handleExport} disabled={loading}>
              Export as PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
