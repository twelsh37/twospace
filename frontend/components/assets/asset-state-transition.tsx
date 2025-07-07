// frontend/components/assets/asset-state-transition.tsx
// Asset State Transition Component for lifecycle management

"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetType, AssetState, Asset } from "@/lib/types";
import {
  ASSET_STATE_LABELS,
  getValidNextStates,
  VALID_STATE_TRANSITIONS,
} from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import React from "react";
import { mutate } from "swr";

interface AssetStateTransitionProps {
  asset: {
    id: string;
    assetNumber: string; // Add assetNumber for backend API compatibility
    type: AssetType;
    state: AssetState;
    // Add other fields as needed
  };
  setAsset: (asset: Asset) => void; // Use Asset type for setAsset
}

// Utility function to map asset state to solid background color classes (matches badge colors)
function getStateColorClass(state: AssetState): string {
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white border-blue-600";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white border-teal-600";
    case AssetState.BUILDING:
      return "bg-orange-500 text-white border-orange-500";
    case AssetState.READY_TO_GO:
      return "bg-purple-600 text-white border-purple-600";
    case AssetState.ISSUED:
      return "bg-green-600 text-white border-green-600";
    default:
      return "bg-gray-400 text-white border-gray-400";
  }
}

export function AssetStateTransition({
  asset,
  setAsset,
}: AssetStateTransitionProps) {
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showModal, setShowModal] = useState<null | AssetState>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState(asset.state);

  // Get valid next states for this asset
  const validNextStates = getValidNextStates(asset.type, currentState);

  // Define the ordered lifecycle for this asset type
  // (For simplicity, use the keys from VALID_STATE_TRANSITIONS for the asset type)
  const lifecycleStates = Object.keys(
    VALID_STATE_TRANSITIONS[asset.type]
  ) as AssetState[];

  // Find the index of the current state
  const currentIndex = lifecycleStates.indexOf(currentState);

  // Handles the state transition after confirmation
  const handleStateTransition = async (nextState: AssetState) => {
    setIsTransitioning(true);
    setError(null);
    try {
      if (!user) {
        setError("You must be signed in to perform this action.");
        setIsTransitioning(false);
        return;
      }
      // Use asset.assetNumber and user.id for backend API
      const res = await fetch("/api/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetIds: [asset.assetNumber],
          operation: "stateTransition",
          payload: { newState: nextState, userId: user.id },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Transition failed");
      setCurrentState(nextState); // Update local state
      setShowModal(null);
      // Fetch updated asset and update parent state
      const updatedRes = await fetch(`/api/assets/${asset.assetNumber}`);
      if (updatedRes.ok) {
        const updatedJson = await updatedRes.json();
        setAsset(updatedJson.data);
      }
      // Invalidate SWR cache for all /api/assets keys to sync all asset lists
      mutate(
        (key) => typeof key === "string" && key.startsWith("/api/assets"),
        undefined,
        { revalidate: true }
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsTransitioning(false);
    }
  };

  // Render the progress bar with badges and connecting lines
  return (
    <Card>
      <CardHeader>
        <CardTitle>State Transition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="flex items-center justify-between space-x-2 overflow-x-auto pb-2">
          {lifecycleStates.map((state, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isNext =
              validNextStates.includes(state) && idx === currentIndex + 1;
            const isAvailableStock = state === AssetState.AVAILABLE;
            // Determine if this badge is clickable
            const canTransitionTo =
              (isNext && !isCurrent) || (isAvailableStock && !isCurrent); // Allow return to Available Stock
            // Determine color classes
            let colorClass = "";
            if (isCompleted || isCurrent) {
              colorClass = getStateColorClass(state);
            } else if (isNext) {
              colorClass = "bg-white text-blue-600 border-blue-400";
            } else {
              colorClass = "bg-gray-200 text-gray-500 border-gray-300";
            }
            // Click handler for badge
            const handleBadgeClick = () => {
              if (isCurrent) {
                toast.error("This is not a valid transition");
                return;
              }
              if (canTransitionTo) {
                setShowModal(state);
              } else {
                toast.error("This is not a valid transition");
              }
            };
            return (
              <React.Fragment key={state}>
                <div className="flex flex-col items-center">
                  <button
                    disabled={isCurrent || isTransitioning}
                    onClick={handleBadgeClick}
                    className={`
                      rounded-full px-3 py-1 text-xs font-semibold
                      border-2
                      ${colorClass}
                      transition-colors duration-200
                      ${
                        canTransitionTo && !isCurrent && !isTransitioning
                          ? "cursor-pointer hover:shadow-md"
                          : "cursor-default"
                      }
                    `}
                    style={{ minWidth: 90 }}
                    tabIndex={canTransitionTo ? 0 : -1}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {ASSET_STATE_LABELS[state]}
                  </button>
                  {/* Confirmation Modal for this state */}
                  {showModal === state && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">
                          Confirm Transition
                        </h3>
                        <p className="mb-4">
                          Are you sure you want to transition this asset from{" "}
                          <b>{ASSET_STATE_LABELS[currentState]}</b> to{" "}
                          <b>{ASSET_STATE_LABELS[state]}</b>?
                        </p>
                        {error && (
                          <div className="text-red-600 mb-2">{error}</div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowModal(null)}
                            disabled={isTransitioning}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleStateTransition(state)}
                            disabled={isTransitioning}
                          >
                            {isTransitioning ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Draw connecting line except after last badge */}
                {idx < lifecycleStates.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      isCompleted
                        ? getStateColorClass(state).split(" ")[0]
                        : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Transition Rules */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Transition Rules:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• State changes are tracked in the audit trail</li>
            <li>• Issued assets can only return to Available Stock</li>
            <li>
              • Mobile phones, tablets, laptops, and desktops must be rebuilt
              after being issued
            </li>
            <li>• Monitors skip the BUILDING state in the lifecycle</li>
            <li>
              • All devices must go through proper configuration before
              re-issuance
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
