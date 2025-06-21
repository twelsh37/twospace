// frontend/components/dashboard/recent-activity.tsx
// Recent Activity Component for Dashboard

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetState, AssetType } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";
import { Activity } from "lucide-react";

type RecentActivityProps = {
  data: {
    id: string;
    assetId: string;
    newState: string;
    type: string;
    changeReason: string | null;
    timestamp: string;
    userName: string;
    assetDescription: string | null;
  }[];
};

export function RecentActivity({ data }: RecentActivityProps) {
  // Color mapping based on Asset Type, consistent with AssetsByType component
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity found.</p>
        </CardContent>
      </Card>
    );
  }

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
          {data.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {/* Timeline dot */}
              <div
                className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(
                  activity.type as AssetType
                )}`}
              />

              {/* Activity content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {activity.assetId}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ASSET_STATE_LABELS[activity.newState as AssetState] ||
                        activity.newState}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(new Date(activity.timestamp))}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground truncate mt-1">
                  {activity.assetDescription || "No description"}
                </p>

                <p className="text-xs text-muted-foreground">
                  by {activity.userName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
