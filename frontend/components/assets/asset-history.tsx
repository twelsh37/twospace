// frontend/components/assets/asset-history.tsx

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

// Asset History Component for audit trail

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { History, ArrowRight } from "lucide-react";
import { AssetState } from "@/lib/types";
import useSWR from "swr";

interface AssetHistoryProps {
  assetNumber?: string; // Optionally pass assetNumber for direct API fetch
}

// Type for asset history API response
type AssetHistoryEntry = {
  previousState?: AssetState;
  newState: AssetState;
  changedBy: string;
  timestamp: string;
  changeReason?: string;
  userName?: string;
};

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

export function AssetHistory({ assetNumber }: AssetHistoryProps) {
  // Fetch assetNumber if not provided (for backward compatibility)
  // In your usage, pass assetNumber directly for best performance
  const assetNum = assetNumber;
  // Fetch real asset history from API
  const { data, error, isLoading } = useSWR(
    assetNum ? `/api/assets/${assetNum}/history` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch asset history");
      return res.json();
    }
  );
  // Show the 6 most recent transactions, including 'Bulk state transition' entries
  const history: AssetHistoryEntry[] = data?.data ? data.data.slice(0, 6) : [];

  const getStateColor = (state: AssetState) => {
    switch (state) {
      case AssetState.AVAILABLE:
        return "bg-blue-500";
      case AssetState.SIGNED_OUT:
        return "bg-yellow-500";
      case AssetState.BUILDING:
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
    <Card className="flex flex-col h-full min-h-[600px]">
      {" "}
      {/* Adjust min-h as needed */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Asset History
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading history...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error loading history
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No history available for this asset
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={index} className="relative">
                {/* Timeline line */}
                {index < history.length - 1 && (
                  <div className="absolute left-3 top-8 w-0.5 h-16 bg-border" />
                )}
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div
                    className={`w-6 h-6 rounded-full ${getStateColor(
                      entry.newState
                    )} flex items-center justify-center mt-1`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  {/* Entry content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {entry.previousState && (
                          <>
                            <Badge
                              className={
                                "text-xs " +
                                getStateColorClass(entry.previousState)
                              }
                            >
                              {ASSET_STATE_LABELS[entry.previousState]}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </>
                        )}
                        <Badge
                          className={
                            "text-xs " + getStateColorClass(entry.newState)
                          }
                        >
                          {ASSET_STATE_LABELS[entry.newState]}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.userName && (
                      <div className="text-xs text-muted-foreground mb-1">
                        By: {entry.userName}
                      </div>
                    )}
                    {entry.changeReason && (
                      <p className="text-sm font-medium mb-1">
                        {entry.changeReason === "Bulk state transition"
                          ? "State Transition"
                          : entry.changeReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
