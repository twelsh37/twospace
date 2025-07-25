// frontend/components/ui/barcode-scanner.tsx

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

// Barcode scanner component supporting both USB scanner and camera input
// Cross-platform compatible for Windows, macOS, and Linux

"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./button";
import { Input } from "./input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

// Type for QuaggaJS result
interface QuaggaResult {
  codeResult: {
    code: string;
  };
}

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCameraOption?: boolean;
}

export function BarcodeScanner({
  onScan,
  placeholder = "Scan barcode or enter manually...",
  disabled = false,
  className = "",
  showCameraOption = true,
}: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle USB barcode scanner input (works like keyboard)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);

    // Most USB barcode scanners end with Enter key
    // We'll detect this by checking if the input ends with a newline or if Enter was pressed
    if (value.includes("\n") || value.includes("\r")) {
      const cleanBarcode = value.replace(/[\r\n]/g, "").trim();
      if (cleanBarcode) {
        handleBarcodeScanned(cleanBarcode);
      }
    }
  };

  // Process scanned barcode
  const handleBarcodeScanned = useCallback(
    (scannedBarcode: string) => {
      onScan(scannedBarcode);
      setBarcode("");

      // Focus back to input for next scan
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [onScan]
  );

  // Camera-based scanning with QuaggaJS
  const startCameraScanning = async () => {
    if (!showCameraOption) return;

    setIsCameraOpen(true);
    setCameraError(null);
    setIsScanning(true);

    try {
      // Dynamically import QuaggaJS to avoid SSR issues
      const Quagga = await import("quagga");

      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoRef.current,
            constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: "environment", // Use back camera on mobile
            },
          },
          decoder: {
            readers: [
              "code_128_reader",
              "code_39_reader",
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
            ],
          },
          locate: true,
        },
        (err: unknown) => {
          if (err) {
            console.error("Quagga initialization error:", err);
            setCameraError(
              "Failed to initialize camera. Please check permissions."
            );
            setIsScanning(false);
            return;
          }

          Quagga.start();
        }
      );

      // Handle successful scans
      Quagga.onDetected((result: unknown) => {
        // Type guard for QuaggaJS result
        if (
          result &&
          typeof result === "object" &&
          "codeResult" in result &&
          result.codeResult &&
          typeof result.codeResult === "object" &&
          "code" in result.codeResult &&
          typeof result.codeResult.code === "string"
        ) {
          const code = (result as QuaggaResult).codeResult.code;
          // Stop scanning and close camera
          Quagga.stop();
          setIsCameraOpen(false);
          setIsScanning(false);
          // Process the scanned barcode
          handleBarcodeScanned(code);
        }
      });
    } catch (error) {
      console.error("Error loading QuaggaJS:", error);
      setCameraError(
        "Failed to load barcode scanner. Please try USB scanner instead."
      );
      setIsScanning(false);
    }
  };

  // Stop camera scanning
  const stopCameraScanning = async () => {
    try {
      const Quagga = await import("quagga");
      Quagga.stop();
    } catch (error) {
      console.error("Error stopping Quagga:", error);
    }
    setIsCameraOpen(false);
    setIsScanning(false);
    setCameraError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopCameraScanning();
      }
    };
  }, [isScanning]);

  // Auto-focus input on mount for better UX
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main barcode input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full"
            autoComplete="off"
            autoFocus={!disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && barcode.trim()) {
                e.preventDefault();
                handleBarcodeScanned(barcode.trim());
              }
            }}
          />
        </div>

        {/* Manual submit button */}
        <Button
          type="button"
          disabled={disabled || !barcode.trim()}
          variant="outline"
          size="sm"
          onClick={() => {
            if (barcode.trim()) {
              handleBarcodeScanned(barcode.trim());
            }
          }}
        >
          Enter
        </Button>

        {/* Camera scan button */}
        {showCameraOption && (
          <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                disabled={disabled}
                variant="outline"
                size="sm"
                onClick={startCameraScanning}
              >
                📷 Scan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {cameraError ? (
                  <div className="text-red-500 text-sm p-4 bg-red-50 rounded">
                    {cameraError}
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded"
                      autoPlay
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none" />
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCameraScanning}
                  >
                    Cancel
                  </Button>
                  <p className="text-sm text-gray-500 self-center">
                    Point camera at barcode
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        {showCameraOption
          ? "Use USB barcode scanner or click 📷 to scan with camera"
          : "Use USB barcode scanner or type manually"}
      </p>
    </div>
  );
}
