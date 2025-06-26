// frontend/components/dashboard/recent-activity.tsx
// Recent Activity Component for Dashboard

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetState, AssetType } from "@/lib/types";
import { ASSET_STATE_LABELS, getStateColorClass } from "@/lib/constants";
import { Activity } from "lucide-react";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { Asset as DetailedAsset } from "@/components/search/search-results-modal";

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
    assetNumber?: string;
  }[];
};

export function RecentActivity({ data }: RecentActivityProps) {
  const [selectedAsset, setSelectedAsset] = useState<DetailedAsset | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivityClick = async (assetId: string) => {
    setIsLoading(true);
    setIsModalOpen(true);
    setSelectedAsset(null);

    try {
      const response = await fetch(`/api/assets/${assetId}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedAsset(result.data);
      } else {
        console.error("Failed to fetch asset details");
        setSelectedAsset(null);
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
      setSelectedAsset(null);
    } finally {
      setIsLoading(false);
    }
  };

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
    <>
      <Card className="flex h-full flex-col shadow-md border border-gray-200 rounded-lg justify-between">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex flex-col gap-2 h-full justify-between">
            {data.map((activity) => (
              <Card
                key={activity.id}
                className="p-2 hover:bg-muted/50 cursor-pointer transition-colors shadow-none border border-gray-100"
                onClick={() => handleActivityClick(activity.assetId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${getTypeColor(
                        activity.type as AssetType
                      )}`}
                    />
                    <span className="truncate font-medium text-sm">
                      {activity.assetNumber || activity.assetId}
                    </span>
                    <Badge
                      className={
                        "text-xs " +
                        getStateColorClass(activity.newState as AssetState)
                      }
                    >
                      {ASSET_STATE_LABELS[activity.newState as AssetState] ||
                        activity.newState}
                    </Badge>
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleString("en-GB")}
                  </span>
                </div>
                <div className="pl-4 -mt-1">
                  <p className="truncate text-sm text-muted-foreground">
                    {activity.assetDescription || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.userName}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <AssetDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        asset={selectedAsset}
        isLoading={isLoading}
      />
    </>
  );
}
