// frontend/components/dashboard/recent-activity.tsx
// Recent Activity Component for Dashboard

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetHistory, AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";
import { Activity, ArrowRight } from "lucide-react";

export function RecentActivity() {
  // TODO: Replace with real data from API
  const recentActivity: AssetHistory[] = [
    {
      id: "1",
      assetId: "01-00001",
      previousState: AssetState.AVAILABLE,
      newState: AssetState.SIGNED_OUT,
      changedBy: "john.doe",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      details: { assetNumber: "01-00001", description: "iPhone 15 Pro 256GB" },
    },
    {
      id: "2",
      assetId: "04-00001",
      previousState: AssetState.BUILT,
      newState: AssetState.ISSUED,
      changedBy: "jane.smith",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      details: {
        assetNumber: "04-00001",
        description: 'MacBook Pro 16" M3',
        assignedTo: "John Doe",
      },
    },
    {
      id: "3",
      assetId: "05-00001",
      newState: AssetState.AVAILABLE,
      changedBy: "system",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      details: {
        assetNumber: "05-00001",
        description: 'Dell UltraSharp 27" 4K',
        action: "created",
      },
    },
    {
      id: "4",
      assetId: "03-00001",
      previousState: AssetState.SIGNED_OUT,
      newState: AssetState.BUILT,
      changedBy: "mike.tech",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      details: { assetNumber: "03-00001", description: "Dell OptiPlex 7090" },
    },
    {
      id: "5",
      assetId: "02-00001",
      previousState: AssetState.READY_TO_GO,
      newState: AssetState.ISSUED,
      changedBy: "sara.admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      details: {
        assetNumber: "02-00001",
        description: 'iPad Pro 12.9"',
        assignedTo: "Alice Johnson",
      },
    },
  ];

  const getStateColor = (state: AssetState) => {
    switch (state) {
      case AssetState.AVAILABLE:
        return "bg-blue-500";
      case AssetState.SIGNED_OUT:
        return "bg-yellow-500";
      case AssetState.BUILT:
        return "bg-green-500";
      case AssetState.READY_TO_GO:
        return "bg-purple-500";
      case AssetState.ISSUED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {/* Timeline dot */}
              <div
                className={`w-2 h-2 rounded-full mt-2 ${getStateColor(
                  activity.newState
                )}`}
              />

              {/* Activity content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {activity.details?.assetNumber}
                    </span>
                    {activity.previousState && (
                      <>
                        <Badge variant="outline" className="text-xs">
                          {ASSET_STATE_LABELS[activity.previousState]}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {ASSET_STATE_LABELS[activity.newState]}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground truncate mt-1">
                  {activity.details?.description}
                  {activity.details?.assignedTo && (
                    <span> • Assigned to {activity.details.assignedTo}</span>
                  )}
                </p>

                <p className="text-xs text-muted-foreground">
                  by {activity.changedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
