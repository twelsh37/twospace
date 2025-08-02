// frontend/components/ui/disposition-dialog.tsx

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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Trash2 } from "lucide-react";

interface DispositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (disposition: "RESTOCK" | "RECYCLE") => void;
  assetNumber: string;
  userName: string;
}

export function DispositionDialog({
  open,
  onOpenChange,
  onConfirm,
  assetNumber,
  userName,
}: DispositionDialogProps) {
  const [selectedDisposition, setSelectedDisposition] = useState<"RESTOCK" | "RECYCLE" | null>(null);

  const handleConfirm = () => {
    if (selectedDisposition) {
      onConfirm(selectedDisposition);
      setSelectedDisposition(null);
    }
  };

  const handleCancel = () => {
    setSelectedDisposition(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Asset Disposition</DialogTitle>
          <DialogDescription>
            Choose what to do with asset {assetNumber} when removing it from {userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Restock Option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedDisposition === "RESTOCK" 
                ? "ring-2 ring-blue-500 bg-blue-50" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedDisposition("RESTOCK")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Restock</h3>
                  <p className="text-sm text-blue-700">
                    Return asset to available inventory for reassignment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recycle Option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedDisposition === "RECYCLE" 
                ? "ring-2 ring-red-500 bg-red-50" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedDisposition("RECYCLE")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Recycle</h3>
                  <p className="text-sm text-red-700">
                    Mark asset for disposal or recycling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDisposition}
            className={
              selectedDisposition === "RECYCLE" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-blue-600 hover:bg-blue-700"
            }
          >
            Confirm {selectedDisposition?.toLowerCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 