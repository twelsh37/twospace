// frontend/components/search/barcode-search.tsx
// Barcode search component for quick asset lookup
// Allows users to scan asset barcodes to find and manage assets

"use client";
import React, { useState } from "react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetType, AssetState } from "@/lib/types";

interface Asset {
  id: string;
  assetNumber: string;
  type: AssetType;
  state: AssetState;
  serialNumber: string;
  description: string;
  purchasePrice: string;
  location: string;
  assignedTo?: string;
  employeeId?: string;
  department?: string;
}

interface BarcodeSearchProps {
  onAssetFound: (asset: Asset) => void;
  onAssetNotFound: (barcode: string) => void;
  className?: string;
}

export function BarcodeSearch({
  onAssetFound,
  onAssetNotFound,
  className = "",
}: BarcodeSearchProps) {
  const [searching, setSearching] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle barcode scan
  const handleBarcodeScan = async (barcode: string) => {
    console.log("Searching for asset with barcode:", barcode);
    setSearching(true);
    setError(null);
    setLastScanned(barcode);

    try {
      // Search for asset by asset number or serial number
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(barcode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search for asset");
      }

      const data = await response.json();

      if (data.assets && data.assets.length > 0) {
        // Found asset(s) - use the first one
        const asset = data.assets[0];
        console.log("Asset found:", asset);
        onAssetFound(asset);
      } else {
        // No asset found
        console.log("No asset found for barcode:", barcode);
        onAssetNotFound(barcode);
      }
    } catch (error) {
      console.error("Error searching for asset:", error);
      setError("Failed to search for asset. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // Asset type display helper
  const getAssetTypeLabel = (type: AssetType): string => {
    const labels: Record<AssetType, string> = {
      [AssetType.MOBILE_PHONE]: "Mobile Phone",
      [AssetType.TABLET]: "Tablet",
      [AssetType.DESKTOP]: "Desktop",
      [AssetType.LAPTOP]: "Laptop",
      [AssetType.MONITOR]: "Monitor",
    };
    return labels[type] || type;
  };

  // Asset state display helper
  const getAssetStateLabel = (state: AssetState): string => {
    const labels: Record<AssetState, string> = {
      [AssetState.AVAILABLE]: "Available",
      [AssetState.SIGNED_OUT]: "Signed Out",
      [AssetState.BUILT]: "Built",
      [AssetState.READY_TO_GO]: "Ready To Go",
      [AssetState.ISSUED]: "Issued",
    };
    return labels[state] || state;
  };

  // State badge color helper
  const getStateBadgeVariant = (
    state: AssetState
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (state) {
      case AssetState.AVAILABLE:
        return "default";
      case AssetState.SIGNED_OUT:
        return "secondary";
      case AssetState.BUILT:
        return "outline";
      case AssetState.READY_TO_GO:
        return "default";
      case AssetState.ISSUED:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Quick Asset Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barcode Scanner */}
        <div className="space-y-2">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            placeholder="Scan asset barcode to search..."
            showCameraOption={true}
            disabled={searching}
          />
        </div>

        {/* Loading State */}
        {searching && (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-gray-500">Searching for asset...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* Last Scanned Info */}
        {lastScanned && !searching && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            Last scanned:{" "}
            <code className="bg-gray-200 px-1 rounded">{lastScanned}</code>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>How to use:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Scan asset barcode with USB scanner or camera</li>
            <li>Asset will be automatically searched and displayed</li>
            <li>Use for quick asset lookup and state transitions</li>
            <li>Works with asset numbers (XX-YYYYY) and serial numbers</li>
          </ul>
        </div>

        {/* Supported Barcode Types */}
        <div className="text-xs text-gray-500">
          <p>
            <strong>Supported formats:</strong> Code 128, Code 39, EAN, UPC
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage component showing how to handle found assets
export function BarcodeSearchWithResults() {
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);

  const handleAssetFound = (asset: Asset) => {
    setFoundAsset(asset);
    setNotFoundBarcode(null);
  };

  const handleAssetNotFound = (barcode: string) => {
    setNotFoundBarcode(barcode);
    setFoundAsset(null);
  };

  return (
    <div className="space-y-6">
      <BarcodeSearch
        onAssetFound={handleAssetFound}
        onAssetNotFound={handleAssetNotFound}
      />

      {/* Found Asset Display */}
      {foundAsset && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Asset Found
              <Badge variant={getStateBadgeVariant(foundAsset.state)}>
                {getAssetStateLabel(foundAsset.state)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Asset Number:</span>
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {foundAsset.assetNumber}
                </code>
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <br />
                {getAssetTypeLabel(foundAsset.type)}
              </div>
              <div>
                <span className="font-medium">Serial Number:</span>
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {foundAsset.serialNumber}
                </code>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <br />
                {foundAsset.location}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Description:</span>
                <br />
                {foundAsset.description}
              </div>
              {foundAsset.assignedTo && (
                <div>
                  <span className="font-medium">Assigned To:</span>
                  <br />
                  {foundAsset.assignedTo}
                  {foundAsset.employeeId && ` (${foundAsset.employeeId})`}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <Button size="sm" variant="outline">
                Change State
              </Button>
              <Button size="sm" variant="outline">
                Edit Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Found Message */}
      {notFoundBarcode && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No asset found with barcode:</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {notFoundBarcode}
              </code>
              <p className="mt-2 text-xs">
                Check if the barcode is correct or if the asset exists in the
                system.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions (duplicated for standalone usage)
function getAssetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
    [AssetType.MOBILE_PHONE]: "Mobile Phone",
    [AssetType.TABLET]: "Tablet",
    [AssetType.DESKTOP]: "Desktop",
    [AssetType.LAPTOP]: "Laptop",
    [AssetType.MONITOR]: "Monitor",
  };
  return labels[type] || type;
}

function getAssetStateLabel(state: AssetState): string {
  const labels: Record<AssetState, string> = {
    [AssetState.AVAILABLE]: "Available",
    [AssetState.SIGNED_OUT]: "Signed Out",
    [AssetState.BUILT]: "Built",
    [AssetState.READY_TO_GO]: "Ready To Go",
    [AssetState.ISSUED]: "Issued",
  };
  return labels[state] || state;
}

function getStateBadgeVariant(
  state: AssetState
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case AssetState.AVAILABLE:
      return "default";
    case AssetState.SIGNED_OUT:
      return "secondary";
    case AssetState.BUILT:
      return "outline";
    case AssetState.READY_TO_GO:
      return "default";
    case AssetState.ISSUED:
      return "secondary";
    default:
      return "outline";
  }
}
