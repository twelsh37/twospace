// frontend/components/assets/asset-detail.tsx
// Asset Detail Component

"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetState, Asset } from "@/lib/types";
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AssetDetailProps {
  assetId: string;
}

// Utility function to map asset state to solid background color classes
const getStateColorClass = (state: AssetState) => {
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white";
    case AssetState.BUILT:
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

export function AssetDetail({ assetId }: AssetDetailProps) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/assets/${assetId}`);
        if (!res.ok) throw new Error("Failed to fetch asset");
        const json = await res.json();
        setAsset(json.data as Asset);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetId]);

  if (loading) {
    return <div className="p-4">Loading asset details...</div>;
  }
  if (error || !asset) {
    return (
      <div className="p-4 text-destructive">
        Error: {error || "Asset not found."}
      </div>
    );
  }

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
