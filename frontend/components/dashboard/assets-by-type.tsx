// frontend/components/dashboard/assets-by-type.tsx

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

// Assets by Type Chart Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetType, DashboardData } from "@/lib/types";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import { BarChart3 } from "lucide-react";

type AssetsByTypeProps = {
  data: DashboardData;
};

export function AssetsByType({ data }: AssetsByTypeProps) {
  const assetsByType = data.assetsByType;
  const totalAssets = assetsByType.reduce((sum, item) => sum + item.count, 0);

  // Fallback for when there are no assets to avoid division by zero
  if (totalAssets === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assets by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No asset data to display.</p>
        </CardContent>
      </Card>
    );
  }

  const assetData = assetsByType.map((item) => ({
    type: item.type as AssetType,
    count: item.count,
    percentage: (item.count / totalAssets) * 100,
  }));

  const getTypeColor = (type: AssetType) => {
    switch (type) {
      case AssetType.LAPTOP:
        return "bg-blue-500";
      case AssetType.MONITOR:
        return "bg-green-500";
      case AssetType.MOBILE_PHONE:
        return "bg-purple-500";
      case AssetType.DESKTOP:
        return "bg-orange-500";
      case AssetType.TABLET:
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Assets by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assetData.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`}
                />
                <span className="text-sm font-medium">
                  {ASSET_TYPE_LABELS[item.type] || item.type}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
                <div className="w-24 bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getTypeColor(item.type)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total Assets</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat("en-GB").format(totalAssets)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
