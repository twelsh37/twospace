// frontend/components/assets/asset-history.tsx
// Asset History Component for audit trail

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_STATE_LABELS } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";
import { History, ArrowRight } from "lucide-react";
import { AssetState } from "@/lib/types";

interface AssetHistoryProps {
  assetId: string;
}

type AssetHistoryType = {
  id: string;
  assetId: string;
  previousState?: AssetState;
  newState: AssetState;
  changedBy: string;
  timestamp: Date;
  changeReason?: string;
  details?: Record<string, unknown>;
};

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

export function AssetHistory({ assetId }: AssetHistoryProps) {
  // TODO: Fetch asset history from API
  const history: AssetHistoryType[] = [
    {
      id: "1",
      assetId,
      newState: AssetState.AVAILABLE,
      changedBy: "system",
      timestamp: new Date("2024-01-15T10:00:00"),
      details: { action: "created", reason: "Initial asset creation" },
    },
    {
      id: "2",
      assetId,
      previousState: AssetState.AVAILABLE,
      newState: AssetState.SIGNED_OUT,
      changedBy: "john.doe",
      timestamp: new Date("2024-01-16T14:30:00"),
      changeReason: "Asset signed out for configuration",
      details: {
        action: "state_transition",
        signedOutBy: "John Doe",
        purpose: "Device setup and configuration",
      },
    },
    {
      id: "3",
      assetId,
      previousState: AssetState.SIGNED_OUT,
      newState: AssetState.BUILT,
      changedBy: "mike.tech",
      timestamp: new Date("2024-01-17T11:15:00"),
      changeReason: "Asset configuration completed",
      details: {
        action: "state_transition",
        configuredBy: "Mike Tech",
        configurationNotes: "iOS setup, corporate apps installed",
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
          <History className="h-5 w-5" />
          Asset History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No history available for this asset
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative">
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
                  <div className="flex-1 min-w-0 pb-4">
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
                        {getRelativeTime(entry.timestamp)}
                      </span>
                    </div>

                    {entry.changeReason && (
                      <p className="text-sm font-medium mb-1">
                        {entry.changeReason}
                      </p>
                    )}

                    {entry.details &&
                      typeof entry.details === "object" &&
                      entry.details !== null && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {"configurationNotes" in entry.details && (
                            <p>
                              Notes:{" "}
                              {
                                (entry.details as Record<string, unknown>)[
                                  "configurationNotes"
                                ] as string
                              }
                            </p>
                          )}
                          {"purpose" in entry.details && (
                            <p>
                              Purpose:{" "}
                              {
                                (entry.details as Record<string, unknown>)[
                                  "purpose"
                                ] as string
                              }
                            </p>
                          )}
                          {"reason" in entry.details && (
                            <p>
                              Reason:{" "}
                              {
                                (entry.details as Record<string, unknown>)[
                                  "reason"
                                ] as string
                              }
                            </p>
                          )}
                        </div>
                      )}

                    <div className="text-xs text-muted-foreground mt-2">
                      Changed by{" "}
                      <span className="font-medium">{entry.changedBy}</span>
                    </div>
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
