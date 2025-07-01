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
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show a brief visual confirmation on scan
  const handleBasicScan = (barcode: string) => {
    console.log("Basic scan:", barcode);
    setScannedBarcodes((prev) => [...prev, barcode]);
    setLastScan(barcode);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1200); // Show for 1.2s
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

      {/* --- USB/Keyboard HID Scanner Section --- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>USB/Keyboard Barcode Scanner (HID) Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            <strong>Instructions:</strong> Connect your USB barcode scanner.
            Click the input below (or press Tab) to focus, then scan a barcode.
            The scanner should type the barcode and press Enter automatically.
            Each scan will be logged and shown below.
          </p>
          <BarcodeScanner
            onScan={handleBasicScan}
            placeholder="Focus here and scan a barcode with your USB scanner..."
            showCameraOption={true}
          />
          {showSuccess && lastScan && (
            <div className="flex items-center gap-2 text-green-600 font-semibold animate-pulse">
              <span>✔ Barcode scanned:</span> <span>{lastScan}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Tabs for other test modes --- */}
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Asset Search</TabsTrigger>
          <TabsTrigger value="form">Asset Form</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

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
                    <div key={index} className="bg-gray-100 rounded px-2 py-1">
                      {barcode}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System info card at the bottom for troubleshooting */}
      <SystemInfoCard />
    </div>
  );
}
