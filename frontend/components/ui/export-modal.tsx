// frontend/components/ui/export-modal.tsx

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
