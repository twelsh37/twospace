// frontend/app/barcode-test/page.tsx
// Test page for barcode scanning functionality
// Allows users to test both USB scanner and camera-based scanning

"use client";
import React, { useState, useEffect } from "react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { BarcodeSearchWithResults } from "@/components/search/barcode-search";
import { AssetFormWithBarcode } from "@/components/assets/asset-form-with-barcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetType, AssetState, AssignmentType } from "@/lib/types";

// Define Asset interface for the test page
interface Asset {
  assetNumber?: string;
  type: AssetType;
  state: AssetState;
  serialNumber: string;
  description: string;
  purchasePrice: string;
  location: string;
  assignmentType: AssignmentType;
  assignedTo?: string;
  employeeId?: string;
  department?: string;
}

// Client-side only component to avoid hydration errors
function SystemInfoCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Browser:</strong> Loading...
          </div>
          <div>
            <strong>HTTPS:</strong> Loading...
          </div>
          <div>
            <strong>Camera Support:</strong> Loading...
          </div>
          <div>
            <strong>QuaggaJS:</strong> Installed and Ready
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>System Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>Browser:</strong> {window.navigator.userAgent}
        </div>
        <div>
          <strong>HTTPS:</strong>{" "}
          {window.location.protocol === "https:" ? "Yes" : "No"}
        </div>
        <div>
          <strong>Camera Support:</strong>{" "}
          {"mediaDevices" in navigator ? "Available" : "Not Available"}
        </div>
        <div>
          <strong>QuaggaJS:</strong> Installed and Ready
        </div>
      </CardContent>
    </Card>
  );
}

export default function BarcodeTestPage() {
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);

  const handleBasicScan = (barcode: string) => {
    console.log("Basic scan:", barcode);
    setScannedBarcodes((prev) => [...prev, barcode]);
  };

  const handleAssetSubmit = async (asset: Partial<Asset>) => {
    console.log("Asset submitted:", asset);
    alert("Asset form submitted! Check console for details.");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Barcode Scanner Test Page</h1>
        <p className="text-gray-600">
          Test the barcode scanning functionality for your asset management
          system.
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Scanner</TabsTrigger>
          <TabsTrigger value="search">Asset Search</TabsTrigger>
          <TabsTrigger value="form">Asset Form</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Barcode Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Test the basic barcode scanner. Use a USB scanner or camera to
                scan any barcode.
              </p>

              <BarcodeScanner
                onScan={handleBasicScan}
                placeholder="Scan any barcode to test..."
                showCameraOption={true}
              />

              <div className="text-sm text-gray-500">
                <p>
                  <strong>Instructions:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Connect a USB barcode scanner and scan into the input field
                  </li>
                  <li>Or click the 📷 button to use camera scanning</li>
                  <li>Any scanned barcode will be logged to the console</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Search with Barcode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test asset lookup by scanning asset barcodes. This will search
                for assets in your system.
              </p>

              <BarcodeSearchWithResults />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Form with Barcode Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test the asset creation form with integrated barcode scanning
                for asset numbers and serial numbers.
              </p>

              <AssetFormWithBarcode
                mode="create"
                onSubmit={handleAssetSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Recent barcodes scanned in this session:
              </p>

              {scannedBarcodes.length === 0 ? (
                <p className="text-gray-500 italic">No barcodes scanned yet.</p>
              ) : (
                <div className="space-y-2">
                  {scannedBarcodes.map((barcode, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded border text-sm font-mono"
                    >
                      {barcode}
                    </div>
                  ))}
                </div>
              )}

              {scannedBarcodes.length > 0 && (
                <button
                  onClick={() => setScannedBarcodes([])}
                  className="mt-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Clear History
                </button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <SystemInfoCard />

      {/* Troubleshooting Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">USB Scanner Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Test scanner in a text editor first</li>
                <li>Check USB connection</li>
                <li>Verify keyboard layout settings</li>
                <li>Ensure scanner is in keyboard mode</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Camera Scanner Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Grant camera permissions</li>
                <li>Use HTTPS connection</li>
                <li>Ensure good lighting</li>
                <li>Hold camera steady</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
