// frontend/components/assets/asset-add-modal.tsx
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

  // Reset error when modal opens
  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  // Handler for form submission
  const handleSubmit = async (asset: Partial<Asset>) => {
    setError(null);
    try {
      // POST to API (same as /assets/new page would do)
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
      });
      if (!res.ok) throw new Error("Failed to add asset");
      // Optionally call parent callback to refresh asset list
      if (onAdded) onAdded();
      // Close modal
      onOpenChange(false);
    } catch {
      setError("Failed to add asset. Please try again.");
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
