// frontend/components/holding-assets/EditHoldingAssetModal.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Helper to parse asset type from asset number prefix (returns enum value)
// Only validates prefix after first two characters are entered
function getAssetTypeEnumFromNumber(assetNumber: string): string | null {
  // Don't validate until at least 2 characters are entered
  if (assetNumber.length < 2) {
    return null;
  }

  const prefix = assetNumber.slice(0, 2);
  switch (prefix) {
    case "01":
      return "MOBILE_PHONE";
    case "02":
      return "TABLET";
    case "03":
      return "LAPTOP";
    case "04":
      return "DESKTOP";
    case "05":
      return "MONITOR";
    default:
      return null;
  }
}

// Define a type for holding asset props
interface HoldingAsset {
  id: string;
  serialNumber: string;
  description: string;
  supplier?: string;
}

export default function EditHoldingAssetModal({
  asset,
  onClose,
  onSuccess,
}: {
  asset: HoldingAsset;
  onClose: () => void;
  onSuccess: () => void;
}) {
  // State for asset number input
  const [assetNumber, setAssetNumber] = useState("");
  // State for confirmation dialog
  const [confirm, setConfirm] = useState(false);
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for error message
  const [error, setError] = useState("");

  // Parse asset type from asset number (enum value)
  const assetTypeEnum = getAssetTypeEnumFromNumber(assetNumber);

  // Handler for assigning asset number (shows confirmation dialog)
  const handleAssign = () => {
    if (!assetNumber || !assetTypeEnum) {
      setError(
        "Please enter a valid asset number (prefix 01-05). Type is required."
      );
      return;
    }
    setError("");
    setConfirm(true);
  };

  // Handler for confirming the move
  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/holding-assets/assign", {
        method: "POST",
        body: JSON.stringify({
          holdingAssetId: asset.id,
          assetNumber,
          type: assetTypeEnum, // Send the enum value
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        setLoading(false);
        setConfirm(false);
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to promote asset.");
        setLoading(false);
      }
    } catch {
      setError("Server error.");
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2 className="text-lg font-bold mb-2">Assign Asset Number</h2>
      <div className="mb-2">
        Serial Number: <b>{asset.serialNumber}</b>
      </div>
      <div className="mb-2">
        Description: <b>{asset.description}</b>
      </div>
      {asset.supplier && (
        <div className="mb-2">
          Supplier: <b>{asset.supplier}</b>
        </div>
      )}
      <div className="mb-2">
        <label>Asset Number:&nbsp;</label>
        <input
          value={assetNumber}
          onChange={(e) => setAssetNumber(e.target.value)}
          placeholder="Enter or scan asset number"
          className="border px-2 py-1 rounded"
        />
      </div>
      {/* Only show type validation after first two characters are entered */}
      {assetNumber.length >= 2 && (
        <div className="mb-2">
          <span>Type:&nbsp;</span>
          <b>
            {assetTypeEnum || (
              <span className="text-red-500">Unknown (check prefix)</span>
            )}
          </b>
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex gap-2 mt-4">
        <Button onClick={handleAssign} disabled={loading}>
          Assign Asset Number
        </Button>
        <Button onClick={onClose} variant="secondary" disabled={loading}>
          Cancel
        </Button>
      </div>
      {/* Confirmation Dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="font-bold mb-2">Confirm Asset Promotion</h3>
            <div className="mb-2">
              Asset Number: <b>{assetNumber}</b>
            </div>
            <div className="mb-2">
              Type: <b>{assetTypeEnum}</b>
            </div>
            <div className="mb-2">
              Serial Number: <b>{asset.serialNumber}</b>
            </div>
            <div className="mb-2">
              Description: <b>{asset.description}</b>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleConfirm} disabled={loading}>
                Confirm
              </Button>
              <Button
                onClick={() => setConfirm(false)}
                variant="secondary"
                disabled={loading}
              >
                Back
              </Button>
            </div>
            {loading && <div className="mt-2 text-sm">Processing...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
