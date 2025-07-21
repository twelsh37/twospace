// frontend/components/assets/asset-add-modal.tsx

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

// Modal for adding a new asset (follows the pattern of location/user add modals)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AssetForm } from "@/components/assets/asset-form";
import { useState, useEffect } from "react";
import { Asset } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface AssetAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void; // Optional callback after successful add
}

// AssetAddModal: Modal dialog for adding a new asset
// Follows the same pattern as LocationAddModal and UserAddModal
export function AssetAddModal({
  open,
  onOpenChange,
  onAdded,
}: AssetAddModalProps) {
  // Track error state for user feedback
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth(); // Get session from auth context

  // Reset error when modal opens
  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  // Handler for form submission
  const handleSubmit = async (asset: Partial<Asset>) => {
    setError(null);
    try {
      // Attach Authorization header if access token is available
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      // POST to API (same as /assets/new page would do)
      const res = await fetch("/api/assets", {
        method: "POST",
        headers,
        body: JSON.stringify(asset),
      });
      if (!res.ok) {
        // Try to extract error message from backend
        let errorMsg = "Failed to add asset. Please try again.";
        try {
          const errorJson = await res.json();
          if (errorJson && (errorJson.error || errorJson.details)) {
            errorMsg = errorJson.error || errorJson.details;
          }
        } catch {}
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      // Show success toast
      showSuccessToast("Asset added successfully!");

      // Optionally call parent callback to refresh asset list
      if (onAdded) onAdded();
      // Close modal
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to add asset. Please try again.";
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new asset to your inventory.
          </DialogDescription>
        </DialogHeader>
        {/* AssetForm handles its own validation and UI. We pass mode and onSubmit. */}
        <AssetForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
        {/* Error message display */}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </DialogContent>
    </Dialog>
  );
}
