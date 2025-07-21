// frontend/components/dashboard/assets-by-state.tsx

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

// Assets by State Component for Dashboard

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import { Progress } from "@/components/ui/progress";
import { AssetState, AssetType } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { TrendingUp } from "lucide-react";
import { getStateColorClass } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABELS } from "@/lib/constants";

type AssetsByStateProps = {
  data: { state: string; count: number }[];
  buildingByType?: { type: string; count: number }[];
};

export function AssetsByState({
  data,
  buildingByType = [],
}: AssetsByStateProps) {
  const totalAssets = data.reduce((sum, item) => sum + item.count, 0);

  // Fallback for when there are no assets to avoid division by zero
  if (totalAssets === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Building Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No asset data to display.</p>
        </CardContent>
      </Card>
    );
  }

  // Map backend status to frontend AssetState for color/label
  function mapStatusToAssetState(
    status: string
  ): AssetState | "HOLDING" | null {
    switch (status) {
      case "active":
        return AssetState.ISSUED;
      case "stock":
        return AssetState.AVAILABLE;
      case "holding":
        return "HOLDING";
      case "recycled":
        return null; // Not a lifecycle state
      default:
        return null;
    }
  }

  // Add color and label for 'HOLDING' pseudo-state
  function getLifecycleStateColorClass(state: AssetState | "HOLDING") {
    if (state === "HOLDING") return "bg-gray-700 text-white";
    return getStateColorClass(state as AssetState);
  }
  const LIFECYCLE_STATE_LABELS: Record<AssetState | "HOLDING", string> = {
    ...ASSET_STATE_LABELS,
    HOLDING: "Holding (Imported)",
  };

  const stateData = data
    .map((item) => ({
      mappedState: mapStatusToAssetState(item.state),
      state: item.state,
      count: item.count,
      percentage: (item.count / totalAssets) * 100,
    }))
    .filter((item) => item.mappedState !== null);

  // Color map for asset type badges
  const typeColorMap: Record<string, string> = {
    MOBILE_PHONE: "bg-purple-500 text-white",
    TABLET: "bg-pink-500 text-white",
    DESKTOP: "bg-orange-500 text-white",
    LAPTOP: "bg-blue-500 text-white",
    MONITOR: "bg-green-500 text-white",
  };

  // --- Flex row for Building Assets by Type (matches ReadyToGoAssetsCard) ---
  // Order: Desktop, Laptop, Mobile Phone, Tablet
  const BUILDING_TYPE_ORDER = ["DESKTOP", "LAPTOP", "MOBILE_PHONE", "TABLET"];
  // Map type to count for quick lookup
  const typeCountMap: Record<string, number> = {};
  buildingByType.forEach((item) => {
    typeCountMap[item.type] = item.count;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Building Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        {/* Building by Type as a flex row (not grid) for even spacing and order */}
        {buildingByType.length > 0 && (
          <div className="mb-4 w-full">
            {/* Flex row: each type is a flex-col, centered, for vertical alignment */}
            <div className="flex flex-row w-full items-end justify-between gap-2 md:gap-4">
              {BUILDING_TYPE_ORDER.map((type) => (
                <div
                  key={type}
                  className="flex flex-col items-center flex-1 min-w-0"
                >
                  <Badge
                    className={`mb-1 text-xs px-2 py-1 whitespace-nowrap text-center ${typeColorMap[type]}`}
                  >
                    {ASSET_TYPE_LABELS[type as AssetType] || type}
                  </Badge>
                  <div className="text-2xl font-bold">
                    {typeCountMap[type] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Removed Holding (Imported) counter and progress bar for Building Assets card */}
          {stateData
            .filter(
              (item) =>
                item.mappedState !== "HOLDING" &&
                item.mappedState !== null &&
                item.mappedState !== undefined
            )
            .map((item) => (
              <div key={item.state} className="space-y-3">
                {/* State Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${getLifecycleStateColorClass(
                      item.mappedState as AssetState | "HOLDING"
                    )}`}
                  >
                    {LIFECYCLE_STATE_LABELS[
                      item.mappedState as AssetState | "HOLDING"
                    ] || item.state}
                  </span>
                </div>

                {/* Count and Percentage */}
                <div>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.percentage.toFixed(1)}% of total
                  </div>
                </div>

                {/* Progress Bar */}
                {/* Progress bar removed for Building Assets card */}
              </div>
            ))}
        </div>

        {/* Removed summary row (Ready to Deploy, In Processing, In Use, Utilization Rate) for Building Assets card */}
        {/* <div className="mt-2 pt-2 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">
                {getCountByState(AssetState.AVAILABLE)}
              </div>
              <div className="text-xs text-muted-foreground">
                Ready to Deploy
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {getCountByState(AssetState.SIGNED_OUT) +
                  getCountByState(AssetState.BUILDING)}
              </div>
              <div className="text-xs text-muted-foreground">In Processing</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {getCountByState(AssetState.ISSUED)}
              </div>
              <div className="text-xs text-muted-foreground">In Use</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(
                  (getCountByState(AssetState.ISSUED) / totalAssets) * 100
                )}
                %
              </div>
              <div className="text-xs text-muted-foreground">
                Utilization Rate
              </div>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
