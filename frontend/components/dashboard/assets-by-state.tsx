// frontend/components/dashboard/assets-by-state.tsx
// Assets by State Component for Dashboard

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { TrendingUp } from "lucide-react";

export function AssetsByState() {
  // TODO: Replace with real data from API
  const stateData = [
    {
      state: AssetState.AVAILABLE,
      count: 312,
      percentage: 25.3,
      trend: "+5.2%",
    },
    { state: AssetState.ISSUED, count: 687, percentage: 55.7, trend: "+12.1%" },
    {
      state: AssetState.READY_TO_GO,
      count: 145,
      percentage: 11.8,
      trend: "-2.3%",
    },
    {
      state: AssetState.SIGNED_OUT,
      count: 67,
      percentage: 5.4,
      trend: "+8.7%",
    },
    { state: AssetState.BUILT, count: 23, percentage: 1.8, trend: "+15.2%" },
  ];

  const getStateColor = (state: AssetState) => {
    switch (state) {
      case AssetState.AVAILABLE:
        return "text-blue-600 bg-blue-100";
      case AssetState.ISSUED:
        return "text-red-600 bg-red-100";
      case AssetState.READY_TO_GO:
        return "text-green-600 bg-green-100";
      case AssetState.SIGNED_OUT:
        return "text-yellow-600 bg-yellow-100";
      case AssetState.BUILT:
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getProgressColor = (state: AssetState) => {
    switch (state) {
      case AssetState.AVAILABLE:
        return "bg-blue-500";
      case AssetState.ISSUED:
        return "bg-red-500";
      case AssetState.READY_TO_GO:
        return "bg-green-500";
      case AssetState.SIGNED_OUT:
        return "bg-yellow-500";
      case AssetState.BUILT:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Asset Lifecycle Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stateData.map((item) => (
            <div key={item.state} className="space-y-3">
              {/* State Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${getStateColor(
                    item.state
                  )}`}
                >
                  {ASSET_STATE_LABELS[item.state]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.trend}
                </span>
              </div>

              {/* Count and Percentage */}
              <div>
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm text-muted-foreground">
                  {item.percentage}% of total
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress value={item.percentage} className="h-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary Information */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">
                {stateData.find((s) => s.state === AssetState.AVAILABLE)
                  ?.count || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Ready to Deploy
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {(stateData.find((s) => s.state === AssetState.SIGNED_OUT)
                  ?.count || 0) +
                  (stateData.find((s) => s.state === AssetState.BUILT)?.count ||
                    0)}
              </div>
              <div className="text-xs text-muted-foreground">In Processing</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {stateData.find((s) => s.state === AssetState.ISSUED)?.count ||
                  0}
              </div>
              <div className="text-xs text-muted-foreground">In Use</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(
                  ((stateData.find((s) => s.state === AssetState.ISSUED)
                    ?.count || 0) /
                    stateData.reduce((sum, item) => sum + item.count, 0)) *
                    100
                )}
                %
              </div>
              <div className="text-xs text-muted-foreground">
                Utilization Rate
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
