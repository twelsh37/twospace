"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, GripVertical } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AssignAssetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAssetAssigned?: () => void;
  refreshTrigger?: number; // Add this to trigger refresh
}

interface AvailableAsset {
  id: string;
  assetNumber: string;
  type: string;
  description: string;
  state: string;
  location: string;
}

// Asset type categories with color coding
const ASSET_CATEGORIES = {
  MOBILE_PHONE: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    displayName: "Mobile Phone",
  },
  TABLET: {
    color: "bg-pink-100 text-pink-800 border-pink-200",
    displayName: "Tablet",
  },
  LAPTOP: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    displayName: "Laptop",
  },
  DESKTOP: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    displayName: "Desktop",
  },
  MONITOR: {
    color: "bg-green-100 text-green-800 border-green-200",
    displayName: "Monitor",
  },
} as const;

export function AssignAssetsDrawer({
  isOpen,
  onClose,
  userId,
  onAssetAssigned,
  refreshTrigger,
}: AssignAssetsDrawerProps) {
  console.log("AssignAssetsDrawer: Component rendered with props:", {
    isOpen,
    userId,
    hasOnClose: !!onClose,
    hasOnAssetAssigned: !!onAssetAssigned,
    refreshTrigger,
  });
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const [draggedAsset, setDraggedAsset] = useState<AvailableAsset | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [assignedAssets, setAssignedAssets] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Get auth context for API calls
  const { session } = useAuth();

  // Fetch available assets when drawer opens
  useEffect(() => {
    if (!isOpen || !session?.access_token) {
      console.log(
        "AssignAssetsDrawer: Skipping fetch - isOpen:",
        isOpen,
        "hasToken:",
        !!session?.access_token
      );
      return;
    }

    setLoading(true);
    console.log(
      "AssignAssetsDrawer: Fetching available assets (trigger:",
      refreshTrigger,
      ")"
    );
    async function fetchAvailableAssets() {
      if (!session?.access_token) {
        console.error(
          "AssignAssetsDrawer: No session or access token available"
        );
        setAvailableAssets([]);
        setLoading(false);
        return;
      }

      try {
        console.log(
          "AssignAssetsDrawer: Fetching available assets with token:",
          session.access_token.substring(0, 20) + "..."
        );

        // First, test authentication
        console.log("AssignAssetsDrawer: Testing authentication...");
        const authTestResponse = await fetch("/api/test-auth", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        console.log(
          "AssignAssetsDrawer: Auth test response status:",
          authTestResponse.status
        );
        if (!authTestResponse.ok) {
          const authErrorText = await authTestResponse.text();
          console.error("AssignAssetsDrawer: Auth test failed:", authErrorText);
          throw new Error(`Authentication failed: ${authTestResponse.status}`);
        }

        const authTestData = await authTestResponse.json();
        console.log("AssignAssetsDrawer: Auth test successful:", authTestData);

        // Now fetch available assets
        const response = await fetch("/api/assets/available", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        console.log(
          "AssignAssetsDrawer: Response status:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AssignAssetsDrawer: API error response:", errorText);
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("AssignAssetsDrawer: API response data:", data);

        if (data.success) {
          console.log("AssignAssetsDrawer: Available assets:", data.assets);
          console.log("AssignAssetsDrawer: Assets by type:", data.assetsByType);
          setAvailableAssets(data.assets || []);
        } else {
          console.error(
            "AssignAssetsDrawer: API returned success=false:",
            data.error
          );
          setAvailableAssets([]);
        }
      } catch (error) {
        console.error("AssignAssetsDrawer: Fetch error details:", error);
        setAvailableAssets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailableAssets();
  }, [isOpen, session, refreshTrigger]); // Add refreshTrigger to dependencies

  // Group assets by type
  const assetsByType = availableAssets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, AvailableAsset[]>);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, asset: AvailableAsset) => {
    // If in select mode and no assets selected, select this one
    if (isSelectMode && selectedAssets.size === 0) {
      setSelectedAssets(new Set([asset.id]));
    }

    // If in select mode and assets are selected, drag all selected
    if (isSelectMode && selectedAssets.size > 0) {
      const selectedAssetList = availableAssets.filter((a) =>
        selectedAssets.has(a.id)
      );
      e.dataTransfer.setData("text/plain", JSON.stringify(selectedAssetList));
      console.log("Dragging multiple assets:", selectedAssetList);
    } else {
      // Single asset drag
      setDraggedAsset(asset);
      e.dataTransfer.setData("text/plain", JSON.stringify(asset));
    }

    e.dataTransfer.effectAllowed = "move";

    // Add visual feedback to dragged element
    const target = e.target as HTMLElement;
    target.style.opacity = "0.5";
    target.style.transform = "scale(0.95)";
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedAsset(null);

    // Reset visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "scale(1)";
  };

  // Handle asset selection
  const handleAssetSelect = (assetId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssets);
    if (checked) {
      newSelected.add(assetId);
    } else {
      newSelected.delete(assetId);
    }
    setSelectedAssets(newSelected);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedAssets(new Set());
    setIsSelectMode(false);
  };

  // Clear selection when drawer closes or refreshes
  useEffect(() => {
    setSelectedAssets(new Set());
    setIsSelectMode(false);
  }, [refreshTrigger]);

  // Handle drop on assigned area
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!draggedAsset || !session?.access_token) return;

    try {
      const response = await fetch(`/api/users/${userId}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          assetId: draggedAsset.id,
        }),
      });

      if (response.ok) {
        // Show success animation
        setAssignedAssets((prev) => [...prev, draggedAsset.id]);

        // Remove asset from available list
        setAvailableAssets((prev) =>
          prev.filter((asset) => asset.id !== draggedAsset.id)
        );

        // Notify parent component
        onAssetAssigned?.();

        // Clear success animation after 2 seconds
        setTimeout(() => {
          setAssignedAssets((prev) =>
            prev.filter((id) => id !== draggedAsset.id)
          );
        }, 2000);
      } else {
        console.error("Failed to assign asset");
      }
    } catch (error) {
      console.error("Error assigning asset:", error);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="flex flex-col" style={{ height: "60vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Assign Assets</h2>
          {isSelectMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedAssets.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSelectMode(!isSelectMode)}
            className="h-8 px-3 text-sm"
          >
            {isSelectMode ? "Exit Select" : "Multi-Select"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Loading available assets...
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Asset Types Grid */}
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(ASSET_CATEGORIES).map(
                ([category, styling], index) => {
                  const categoryAssets = assetsByType[category] || [];
                  const assetNumber = String(index + 1).padStart(2, "0"); // 01, 02, 03, etc.

                  return (
                    <div
                      key={category}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                    >
                      {/* Category Header with Number */}
                      <div className="p-3 bg-gray-50 border-b">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={styling.color}>
                            {styling.displayName}
                          </Badge>
                          <span className="text-xs font-mono text-gray-500">
                            {assetNumber}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {categoryAssets.length} available
                        </div>
                      </div>

                      {/* Asset Grid */}
                      <div className="p-3">
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                          {categoryAssets.slice(0, 4).map((asset) => (
                            <div
                              key={asset.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, asset)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => e.stopPropagation()}
                              className={`p-2 border rounded cursor-grab hover:bg-gray-50 hover:shadow-sm transition-all duration-200 active:cursor-grabbing group ${
                                selectedAssets.has(asset.id)
                                  ? "bg-blue-50 border-blue-300"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelectMode && (
                                  <input
                                    type="checkbox"
                                    checked={selectedAssets.has(asset.id)}
                                    onChange={(e) =>
                                      handleAssetSelect(
                                        asset.id,
                                        e.target.checked
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                )}
                                <GripVertical className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">
                                    {asset.assetNumber}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {asset.description}
                                  </div>
                                </div>
                                {assignedAssets.includes(asset.id) && (
                                  <Check className="h-3 w-3 text-green-600 animate-pulse flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                          {categoryAssets.length > 4 && (
                            <div className="text-xs text-muted-foreground text-center py-1 bg-gray-50 rounded">
                              +{categoryAssets.length - 4} more
                            </div>
                          )}
                          {categoryAssets.length === 0 && (
                            <div className="text-xs text-muted-foreground text-center py-2">
                              No assets
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Drop Zone for Assigned Assets */}
            <div
              className={`p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
                isDragOver
                  ? "border-blue-400 bg-blue-50 shadow-lg"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={(e) => e.stopPropagation()}
                className="text-center py-6"
              >
                <div
                  className={`text-lg font-medium mb-2 transition-colors ${
                    isDragOver ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {isDragOver
                    ? "Drop to assign asset"
                    : "Drop assets here to assign"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Drag assets from the grid above to assign them to this user
                </div>
                {isDragOver && draggedAsset && (
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    Assigning: {draggedAsset.assetNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
