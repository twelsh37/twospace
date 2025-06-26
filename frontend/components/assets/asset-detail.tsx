// frontend/components/assets/asset-detail.tsx
// Asset Detail Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetType, AssetState } from "@/lib/types";
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

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

export function AssetDetail({ assetId }: AssetDetailProps) {
  // TODO: Fetch asset data from API
  const asset = {
    id: assetId,
    assetNumber: "01-00001",
    type: AssetType.MOBILE_PHONE,
    state: AssetState.AVAILABLE,
    serialNumber: "MP001234567",
    description: "iPhone 15 Pro 256GB",
    purchasePrice: 1099.99,
    location: "IT Department",
    assignmentType: "INDIVIDUAL" as const,
    assignedTo: "",
    employeeId: "",
    department: "",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  };

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
            <p>{formatCurrency(asset.purchasePrice)}</p>
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
            <p>{asset.location}</p>
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
            <p>{formatDate(asset.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <p>{formatDate(asset.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
