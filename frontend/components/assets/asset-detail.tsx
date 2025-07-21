// frontend/components/assets/asset-detail.tsx

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetState, Asset } from "@/lib/types";
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AssetDetailProps {
  asset: Asset;
}

// Utility function to map asset state to solid background color classes
const getStateColorClass = (state: AssetState) => {
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white";
    case AssetState.BUILDING:
      return "bg-orange-500 text-white";
    case AssetState.READY_TO_GO:
      return "bg-purple-600 text-white";
    case AssetState.ISSUED:
      return "bg-green-600 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

// Helper to safely format date
function safeFormatDate(dateValue: unknown): string {
  if (!dateValue) return "N/A";
  let dateObj: Date;
  if (typeof dateValue === "string") {
    dateObj = new Date(dateValue);
  } else if (dateValue instanceof Date) {
    dateObj = dateValue;
  } else {
    return "N/A";
  }
  return isNaN(dateObj.getTime()) ? "N/A" : formatDate(dateObj);
}

export function AssetDetail({ asset }: AssetDetailProps) {
  // Asset is now passed as a prop and always available

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Asset Information
          <Badge className={getStateColorClass(asset.state)}>
            {ASSET_STATE_LABELS[asset.state]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Asset Number
            </label>
            <p className="text-lg font-mono">{asset.assetNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Type
            </label>
            <p>{ASSET_TYPE_LABELS[asset.type]}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Serial Number
            </label>
            <p className="font-mono">{asset.serialNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Purchase Price
            </label>
            <p>{formatCurrency(parseFloat(asset.purchasePrice))}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <p>{asset.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Location
            </label>
            {/* Only 'location' is provided by the API, not 'locationName' */}
            <p>{asset.location || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Assignment Type
            </label>
            <p>{asset.assignmentType}</p>
          </div>
          {asset.assignedTo && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Assigned To
                </label>
                <p>{asset.assignedTo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Employee ID
                </label>
                <p>{asset.employeeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <p>{asset.department}</p>
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Created
            </label>
            <p>{safeFormatDate(asset.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <p>{safeFormatDate(asset.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
