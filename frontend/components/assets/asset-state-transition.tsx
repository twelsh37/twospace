// frontend/components/assets/asset-state-transition.tsx
// Asset State Transition Component for lifecycle management

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetType, AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS, getValidNextStates } from "@/lib/constants";
import { ArrowRight, Loader2 } from "lucide-react";

interface AssetStateTransitionProps {
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

export function AssetStateTransition({ assetId }: AssetStateTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // TODO: Fetch asset data from API
  const asset = {
    id: assetId,
    type: AssetType.MOBILE_PHONE,
    state: AssetState.AVAILABLE,
  };

  const validNextStates = getValidNextStates(asset.type, asset.state);

  const handleStateTransition = async (newState: AssetState) => {
    setIsTransitioning(true);
    try {
      // TODO: API call to transition state
      console.log(
        `Transitioning asset ${assetId} from ${asset.state} to ${newState}`
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Update asset state
      // TODO: Create audit trail entry
    } catch (error) {
      console.error("Error transitioning state:", error);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>State Transition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Current State:</span>
          <Badge className={getStateColorClass(asset.state)}>
            {ASSET_STATE_LABELS[asset.state]}
          </Badge>
        </div>

        {/* Available Transitions */}
        {validNextStates.length > 0 ? (
          <div className="space-y-3">
            <span className="text-sm font-medium">Available Transitions:</span>
            <div className="space-y-2">
              {validNextStates.map((nextState) => (
                <div
                  key={nextState}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={getStateColorClass(asset.state)}>
                      {ASSET_STATE_LABELS[asset.state]}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getStateColorClass(nextState)}>
                      {ASSET_STATE_LABELS[nextState]}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStateTransition(nextState)}
                    disabled={isTransitioning}
                  >
                    {isTransitioning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Transitioning...
                      </>
                    ) : (
                      "Transition"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No state transitions available for this asset in its current state.
          </div>
        )}

        {/* Transition Rules */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Transition Rules:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• State changes are tracked in the audit trail</li>
            <li>• Some transitions may require additional approvals</li>
            <li>• Monitors skip the BUILT state in the lifecycle</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
