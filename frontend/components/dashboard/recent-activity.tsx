// frontend/components/dashboard/recent-activity.tsx

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetState, AssetType } from "@/lib/types";
import { ASSET_STATE_LABELS, getStateColorClass } from "@/lib/constants";
import { Activity } from "lucide-react";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { Asset as DetailedAsset } from "@/components/search/search-results-modal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/lib/auth-context";

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
  const { session } = useAuth();
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
      // Attach Authorization header if access token is available
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/assets/${assetId}`, {
        headers,
      });
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
