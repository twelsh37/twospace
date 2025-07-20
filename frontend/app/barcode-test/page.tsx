// frontend/app/barcode-test/page.tsx
// Barcode Scanner Test Page - Redesigned layout for desktop and mobile
// Uses a background card like /assets and /reports, with a 2-column grid for desktop

"use client";
import React, { useState, useEffect } from "react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { BarcodeSearchWithResults } from "@/components/search/barcode-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- System Info Card ---
function SystemInfoCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <Card className="w-full">
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
    <Card className="w-full">
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

// --- Main Page Layout ---
export default function BarcodeTestPage() {
  // State for scanned barcodes and UI feedback
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handler for USB/Keyboard scanner
  const handleBasicScan = (barcode: string) => {
    setScannedBarcodes((prev) => [...prev, barcode]);
    setLastScan(barcode);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1200);
  };
  // Handler for Asset Search tab
  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcodes((prev) => [...prev, barcode]);
  };

  return (
    <div className="flex-1 flex flex-col pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8 md:pl-8">
      {/* --- Background Card (like /assets, /reports) --- */}
      <Card
        style={{ maxWidth: 1200, width: "100%", borderRadius: 16 }}
        className="shadow-lg border w-full"
      >
        {/* --- Title and Subheading --- */}
        <CardHeader className="pb-2">
          <CardTitle
            style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
          >
            Barcode Scanner Test Page
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Test the barcode scanning functionality for your asset management
            system.
          </p>
        </CardHeader>
        <CardContent>
          {/* --- Responsive 2-column grid for desktop, stacked on mobile --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Left Column: USB/Keyboard Scanner + System Info (stacked) --- */}
            <div className="flex flex-col gap-6 h-full">
              {/* USB/Keyboard Scanner Card */}
              <Card className="w-full flex-1">
                <CardHeader>
                  <CardTitle>USB/Keyboard Barcode Scanner (HID) Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    <strong>Instructions:</strong> Connect your USB barcode
                    scanner. Focus the input below and scan a barcode. Each scan
                    will be logged below.
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
              {/* System Info Card */}
              <SystemInfoCard />
            </div>
            {/* --- Right Column: Asset Search (tabbed, full height) --- */}
            <div className="flex flex-col h-full">
              <Card className="w-full flex-1 h-full">
                <CardHeader>
                  <CardTitle>Asset Search with Barcode</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Tabs for Asset Search and Scan History */}
                  <Tabs defaultValue="search" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="search">Asset Search</TabsTrigger>
                      <TabsTrigger value="history">Scan History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="search" className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Test asset lookup by scanning asset barcodes. This will
                        search for assets in your system.
                      </p>
                      <BarcodeSearchWithResults
                        onBarcodeScanned={handleBarcodeScanned}
                      />
                    </TabsContent>
                    <TabsContent value="history" className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Recent barcodes scanned in this session:
                      </p>
                      {scannedBarcodes.length === 0 ? (
                        <p className="text-gray-500 italic">
                          No barcodes scanned yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {scannedBarcodes.map((barcode, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 rounded px-2 py-1"
                            >
                              {barcode}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
