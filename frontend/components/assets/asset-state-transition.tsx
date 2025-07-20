// frontend/components/assets/asset-state-transition.tsx
// Asset State Transition Component for lifecycle management

"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetState, Asset } from "@/lib/types";
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
  asset: Asset;
  setAsset: (asset: Asset) => void; // Use Asset type for setAsset
}

// Helper function to get color classes for state badges
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
    case AssetState.HOLDING:
      return "bg-gray-600 text-white border-gray-600";
    default:
      return "bg-gray-400 text-white border-gray-400";
  }
}

export function AssetStateTransition({
  asset,
  setAsset,
}: AssetStateTransitionProps) {
  const { user, session } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showModal, setShowModal] = useState<null | AssetState>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState(asset.state);

  // Get valid next states for this asset
  const validNextStates = getValidNextStates(asset.type, currentState);

  // Build the ordered lifecycle for this asset type by traversing the valid transitions
  function getLifecycleStates(type: Asset["type"]): AssetState[] {
    // Start from AVAILABLE and follow the first transition path
    const transitions = VALID_STATE_TRANSITIONS[type];
    const visited = new Set<AssetState>();
    const order: AssetState[] = [];
    let current: AssetState = AssetState.AVAILABLE;
    while (current && !visited.has(current)) {
      order.push(current);
      visited.add(current);
      const next: AssetState | undefined = transitions[current]?.[0];
      if (!next || visited.has(next)) break;
      current = next;
    }
    // For monitors, add READY_TO_GO if not present (since it's a valid transition)
    if (type === "MONITOR" && !order.includes(AssetState.READY_TO_GO)) {
      order.push(AssetState.READY_TO_GO);
    }
    // Always add ISSUED as the last state if not present
    if (!order.includes(AssetState.ISSUED)) {
      order.push(AssetState.ISSUED);
    }
    return order;
  }

  // Use the correct lifecycle for this asset type
  const lifecycleStates = getLifecycleStates(asset.type);

  // Find the index of the current state
  const currentIndex = lifecycleStates.indexOf(currentState);

  // Handles the state transition after confirmation
  const handleStateTransition = async (nextState: AssetState) => {
    console.log("=== FRONTEND STATE TRANSITION START ===");
    console.log("Transitioning to state:", nextState);
    console.log("Asset:", asset.assetNumber);
    console.log("User:", user?.id, user?.email);

    setIsTransitioning(true);
    setError(null);
    try {
      if (!user) {
        console.log("No user found");
        setError("You must be signed in to perform this action.");
        setIsTransitioning(false);
        return;
      }

      // Use the session from auth context (like other components do)
      if (!session?.access_token) {
        console.log("No access token in session");
        setError("Authentication token not found. Please sign in again.");
        setIsTransitioning(false);
        return;
      }

      console.log("Making API request to /api/assets");
      const requestBody = {
        assetIds: [asset.assetNumber],
        operation: "stateTransition",
        payload: { newState: nextState, userId: user.id },
      };
      console.log("Request body:", requestBody);

      // Use asset.assetNumber and user.id for backend API
      const res = await fetch("/api/assets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", res.status);
      const json = await res.json();
      console.log("Response body:", json);

      if (!json.success) {
        console.log("API call failed:", json.error);
        throw new Error(json.error || "Transition failed");
      }

      console.log("API call successful");
      setCurrentState(nextState); // Update local state
      setShowModal(null);

      console.log("Fetching updated asset");
      // Fetch updated asset and update parent state
      const updatedRes = await fetch(`/api/assets/${asset.assetNumber}`);
      if (updatedRes.ok) {
        const updatedJson = await updatedRes.json();
        setAsset(updatedJson.data);
        console.log("Asset updated in UI");
      }

      // Invalidate SWR cache for all /api/assets keys to sync all asset lists
      mutate(
        (key) => typeof key === "string" && key.startsWith("/api/assets"),
        undefined,
        { revalidate: true }
      );
      console.log("=== FRONTEND STATE TRANSITION COMPLETE ===");
    } catch (err: unknown) {
      console.error("Error in state transition:", err);
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
