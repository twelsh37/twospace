// frontend/components/search/barcode-search.tsx

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

// Barcode search component for quick asset lookup
// Allows users to scan asset barcodes to find and manage assets

"use client";
import React, { useState } from "react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  locationName?: string;
  assignedTo?: string;
  employeeId?: string;
  department?: string;
}

interface BarcodeSearchProps {
  onAssetFound: (asset: Asset) => void;
  onAssetNotFound: (barcode: string) => void;
  className?: string;
  onBarcodeScanned?: (barcode: string) => void;
}

export function BarcodeSearch({
  onAssetFound,
  onAssetNotFound,
  className = "",
  onBarcodeScanned,
}: BarcodeSearchProps) {
  const [searching, setSearching] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null);

  // Handle barcode scan
  const handleBarcodeScan = async (barcode: string) => {
    if (onBarcodeScanned) onBarcodeScanned(barcode);
    setSearching(true);
    setLastScanned(barcode);

    try {
      // Search for asset by asset number or serial number using unified API
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(barcode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search for asset");
      }

      const data = await response.json();
      // Unify with main search modal: expect { success, data: { assets } }
      const assets = data?.data?.assets || [];
      if (assets.length > 0) {
        // Found asset(s) - use the first one
        const asset = assets[0];
        onAssetFound(asset);
        setFoundAsset(asset);
      } else {
        // No asset found
        onAssetNotFound(barcode);
      }
    } catch {
      // setError("Failed to search for asset. Please try again."); // This line was removed
    } finally {
      setSearching(false);
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

        {/* Minimal Asset Details Card (shows immediately when asset is found) */}
        {foundAsset && (
          <Card className="border-green-500 border mt-2">
            <CardHeader>
              <CardTitle className="text-green-700 text-base flex items-center gap-2">
                ✅ Asset Found
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  {foundAsset.assetNumber}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="font-medium">Type:</div>
              <div>{foundAsset.type}</div>
              <div className="font-medium">Serial Number:</div>
              <div>{foundAsset.serialNumber}</div>
              <div className="font-medium">Location:</div>
              <div>
                {foundAsset.locationName || foundAsset.location || "N/A"}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {searching && (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-gray-500">Searching for asset...</div>
          </div>
        )}

        {/* Error State */}
        {/* The 'error' variable was removed, so this block is no longer needed. */}
        {/* {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
            {error}
          </div>
        )} */}

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
export function BarcodeSearchWithResults({
  onBarcodeScanned,
}: {
  onBarcodeScanned?: (barcode: string) => void;
}) {
  const [, setFoundAsset] = useState<Asset | null>(null); // Only setter needed
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);

  // When an asset is found, set state and show minimal details (no navigation)
  const handleAssetFound = (asset: Asset, barcode?: string) => {
    setFoundAsset(asset);
    setNotFoundBarcode(null);
    if (onBarcodeScanned && barcode) onBarcodeScanned(barcode);
  };

  const handleAssetNotFound = (barcode: string) => {
    setNotFoundBarcode(barcode);
    setFoundAsset(null);
    if (onBarcodeScanned) onBarcodeScanned(barcode);
  };

  return (
    <div className="space-y-6">
      <BarcodeSearch
        onAssetFound={(asset) =>
          handleAssetFound(asset, asset.assetNumber || asset.serialNumber)
        }
        onAssetNotFound={handleAssetNotFound}
        onBarcodeScanned={onBarcodeScanned}
      />
      {/* Remove the detailed foundAsset card here. Only show not found message if needed. */}
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
