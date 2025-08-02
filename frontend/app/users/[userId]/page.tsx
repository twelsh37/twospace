// frontend/app/users/[userId]/page.tsx

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

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GripVertical, X, Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DispositionDialog } from "@/components/ui/disposition-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  isActive: boolean;
  employeeId: string;
}

interface Asset {
  assetNumber: string;
  type: string;
  description: string;
  state: string;
  location: string;
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

interface UserDetailsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { userId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignMode, setShowAssignMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Asset reclamation state
  const [showReclaimMode, setShowReclaimMode] = useState(false);
  const [isReclaiming, setIsReclaiming] = useState(false);
  const [reclaimSuccess, setReclaimSuccess] = useState<string | null>(null);
  const [showDispositionDialog, setShowDispositionDialog] = useState(false);
  const [pendingUnassignment, setPendingUnassignment] = useState<Asset | null>(null);

  // Get auth context for API calls
  const { session } = useAuth();

  // Fetch user details and assets
  useEffect(() => {
    if (!userId || !session?.access_token) return;

    setLoading(true);
    async function fetchUserData() {
      if (!session?.access_token) {
        console.error("UserDetailsPage: No session or access token available");
        setUser(null);
        setUserAssets([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch user details
        const userRes = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const userJson = await userRes.json();

        if (userJson.success && userJson.data) {
          setUser(userJson.data);

          // Fetch user's assets
          const assetsRes = await fetch(`/api/users/${userId}/assets`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          const assetsJson = await assetsRes.json();

          if (assetsJson.success && assetsJson.assets) {
            setUserAssets(assetsJson.assets);
          } else {
            setUserAssets([]);
          }
        } else {
          setUser(null);
          setUserAssets([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        setUserAssets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId, session]);

  // Fetch available assets when assign mode is enabled
  useEffect(() => {
    if (!showAssignMode || !session?.access_token) return;

    async function fetchAvailableAssets() {
      try {
        console.log("Fetching available assets...");
        const response = await fetch("/api/assets/available", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        console.log("Available assets response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Available assets response data:", data);

          if (data.success) {
            console.log(
              "Setting available assets:",
              data.assets?.length || 0,
              "assets"
            );
            setAvailableAssets(data.assets || []);
          } else {
            console.error(
              "Available assets API returned success=false:",
              data.error
            );
            setAvailableAssets([]);
          }
        } else {
          const errorText = await response.text();
          console.error(
            "Available assets API error:",
            response.status,
            errorText
          );
          setAvailableAssets([]);
        }
      } catch (error) {
        console.error("Error fetching available assets:", error);
        setAvailableAssets([]);
      }
    }

    fetchAvailableAssets();
  }, [showAssignMode, session]);

  // Handle Assign Assets button click
  const handleAssignAssets = () => {
    setShowAssignMode(true);
    setSelectedAssets(new Set());
    setAssignmentSuccess(null);
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

  // Handle asset assignment via drag and drop
  const handleAssetAssignment = async (assetsToAssign: AvailableAsset[]) => {
    if (!userId || !session?.access_token || assetsToAssign.length === 0)
      return;

    setIsAssigning(true);
    setAssignmentSuccess(null);

    try {
      const assignmentPromises = assetsToAssign.map(async (asset) => {
        console.log(
          `Attempting to assign asset ${asset.assetNumber} to user ${userId}`
        );

        const response = await fetch(
          `/api/assets/${asset.assetNumber}/assign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              userId: userId,
              assetNumber: asset.assetNumber,
            }),
          }
        );

        console.log(
          `Assignment response for ${asset.assetNumber}:`,
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to assign ${asset.assetNumber}:`, errorData);
          throw new Error(
            `Failed to assign ${asset.assetNumber}: ${
              errorData.error || response.statusText
            }`
          );
        }

        const responseData = await response.json();
        console.log(
          `Successfully assigned ${asset.assetNumber}:`,
          responseData
        );

        return { asset, success: true };
      });

      const results = await Promise.allSettled(assignmentPromises);
      const successfulAssignments = results
        .filter((result) => result.status === "fulfilled" && result.value.success)
        .map((result) => (result as PromiseFulfilledResult<{ asset: { assetNumber: string }; success: boolean }>).value.asset);

      if (successfulAssignments.length > 0) {
        // Add a small delay to ensure database is updated
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Refresh user's assets
        const assetsRes = await fetch(`/api/users/${userId}/assets`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (assetsRes.ok) {
          const assetsJson = await assetsRes.json();
          if (assetsJson.success && assetsJson.assets) {
            setUserAssets(assetsJson.assets);
            console.log("Updated user assets:", assetsJson.assets);
          }
        }

        // Update available assets (remove assigned ones)
        setAvailableAssets((prev) =>
          prev.filter(
            (asset) =>
              !successfulAssignments.some(
                (assigned) => assigned.assetNumber === asset.assetNumber
              )
          )
        );

        // Show success message
        if (successfulAssignments.length === 1) {
          setAssignmentSuccess(
            `Asset ${successfulAssignments[0].assetNumber} assigned successfully!`
          );
        } else {
          setAssignmentSuccess(
            `${successfulAssignments.length} assets assigned successfully!`
          );
        }

        // Clear selection
        setSelectedAssets(new Set());

        // Clear success message after 3 seconds
        setTimeout(() => {
          setAssignmentSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error assigning assets:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, asset: AvailableAsset) => {
    // If assets are selected, drag all selected
    if (selectedAssets.size > 0) {
      const selectedAssetList = availableAssets.filter((a) =>
        selectedAssets.has(a.id)
      );
      e.dataTransfer.setData("text/plain", JSON.stringify(selectedAssetList));
    } else {
      // Single asset drag
      e.dataTransfer.setData("text/plain", JSON.stringify([asset]));
    }

    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drop on assignment area
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const assetData = e.dataTransfer.getData("text/plain");
      if (!assetData) return;

      const assetsToAssign = JSON.parse(assetData);
      await handleAssetAssignment(assetsToAssign);
    } catch (error) {
      console.error("Error processing dropped assets:", error);
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

  // Asset reclamation functions
  const handleReclaimAssets = () => {
    setShowReclaimMode(!showReclaimMode);
    setReclaimSuccess(null);
  };

  const handleAssetUnassignment = async (asset: Asset, disposition: "RESTOCK" | "RECYCLE" = "RESTOCK") => {
    if (!session?.access_token) return;

    setIsReclaiming(true);
    try {
      const response = await fetch(`/api/assets/${asset.assetNumber}/unassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: userId,
          disposition: disposition,
        }),
      });

      if (response.ok) {
        await response.json();
        setReclaimSuccess(`Asset ${asset.assetNumber} unassigned successfully (${disposition.toLowerCase()})`);
        
        // Refresh user assets
        setTimeout(async () => {
          const assetsRes = await fetch(`/api/users/${userId}/assets`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (assetsRes.ok) {
            const assetsJson = await assetsRes.json();
            if (assetsJson.success && assetsJson.assets) {
              setUserAssets(assetsJson.assets);
            }
          }
        }, 500);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setReclaimSuccess(null);
        }, 3000);
      } else {
        console.error("Failed to unassign asset:", await response.text());
      }
    } catch (error) {
      console.error("Error unassigning asset:", error);
    } finally {
      setIsReclaiming(false);
    }
  };

  const handleUnassignmentDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const assetData = e.dataTransfer.getData("text/plain");
      if (!assetData) return;

      const assetsToUnassign = JSON.parse(assetData);
      
      if (assetsToUnassign.length === 1) {
        // Single asset - show disposition dialog
        setPendingUnassignment(assetsToUnassign[0]);
        setShowDispositionDialog(true);
      } else {
        // Multiple assets - default to RESTOCK
        for (const asset of assetsToUnassign) {
          await handleAssetUnassignment(asset, "RESTOCK");
        }
        // TODO: Add batch disposition dialog for multiple assets
      }
    } catch (error) {
      console.error("Error processing dropped assets for unassignment:", error);
    }
  };

  const handleDispositionConfirm = (disposition: "RESTOCK" | "RECYCLE") => {
    if (pendingUnassignment) {
      handleAssetUnassignment(pendingUnassignment, disposition);
      setPendingUnassignment(null);
    }
    setShowDispositionDialog(false);
  };

  // Group available assets by type
  const assetsByType = availableAssets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, AvailableAsset[]>);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-sm text-gray-600">Loading user details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center text-red-500">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p>The requested user could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">User Details</h1>
        </div>
        <div className="flex gap-2">
          {!showAssignMode && (
            <Button onClick={handleAssignAssets}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Assets
            </Button>
          )}
          {userAssets.length > 0 && !showAssignMode && (
            <Button 
              variant="outline" 
              onClick={handleReclaimAssets}
              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
            >
              <X className="h-4 w-4 mr-2" />
              Reclaim Assets
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Close
          </Button>
        </div>
      </div>

      {/* Success Messages */}
      {assignmentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <div className="text-green-800 text-sm font-medium">
            ✅ {assignmentSuccess}
          </div>
        </div>
      )}
      {reclaimSuccess && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
          <div className="text-orange-800 text-sm font-medium">
            ✅ {reclaimSuccess}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Personal and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Location: {user.location}</Badge>
              <Badge variant="secondary">Department: {user.department}</Badge>
              <Badge variant="secondary">Employee ID: {user.employeeId}</Badge>
              <Badge variant={user.isActive ? "default" : "destructive"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Assets Card */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Assets ({userAssets.length})</CardTitle>
            <CardDescription>
              Assets currently assigned to this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAssets.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No assets assigned.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-2 text-left">Asset Number</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAssets.map((asset, idx) => (
                      <tr
                        key={asset.assetNumber}
                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} ${
                          showReclaimMode ? "cursor-grab hover:bg-gray-100" : ""
                        }`}
                        draggable={showReclaimMode}
                        onDragStart={showReclaimMode ? (e) => {
                          e.dataTransfer.setData("text/plain", JSON.stringify([asset]));
                          e.dataTransfer.effectAllowed = "move";
                        } : undefined}
                      >
                        <td className="p-2 font-medium">{asset.assetNumber}</td>
                        <td className="p-2">{asset.type}</td>
                        <td className="p-2">{asset.description}</td>
                        <td className="p-2">{asset.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Asset Assignment Section */}
      {showAssignMode && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assign Assets</CardTitle>
                <CardDescription>
                  Select and assign available assets to this user
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedAssets.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedAssets.size} selected
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAssets(new Set())}
                  disabled={selectedAssets.size === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssignMode(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Available Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {Object.entries(ASSET_CATEGORIES).map(
                ([category, styling], index) => {
                  const categoryAssets = assetsByType[category] || [];
                  const assetNumber = String(index + 1).padStart(2, "0");

                  return (
                    <div
                      key={category}
                      className="border rounded-lg overflow-hidden shadow-sm bg-white"
                    >
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

                      <div className="p-3">
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                          {categoryAssets.slice(0, 4).map((asset) => (
                            <div
                              key={asset.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, asset)}
                              className={`p-2 border rounded cursor-grab hover:bg-gray-50 hover:shadow-sm transition-all duration-200 active:cursor-grabbing group ${
                                selectedAssets.has(asset.id)
                                  ? "bg-blue-50 border-blue-300"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
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
                                <GripVertical className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">
                                    {asset.assetNumber}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {asset.description}
                                  </div>
                                </div>
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

            {/* Assignment Drop Zone */}
            <div
              className={`p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
                isDragOver
                  ? "border-blue-400 bg-blue-50 shadow-lg"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <div
                  className={`text-lg font-medium mb-2 transition-colors ${
                    isDragOver ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {isDragOver
                    ? "Drop to assign assets"
                    : "Drop assets here to assign"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Drag assets from the grid above to assign them to this user
                </div>
                {isAssigning && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">
                      Assigning assets...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Reclamation Section */}
      {showReclaimMode && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reclaim Assets</CardTitle>
                <CardDescription>
                  Drag assets from the user&apos;s assigned assets to unassign them
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReclaimMode(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Reclamation Drop Zone */}
            <div
              className={`p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
                isDragOver
                  ? "border-orange-400 bg-orange-50 shadow-lg"
                  : "border-orange-300 bg-orange-50"
              }`}
              onDrop={handleUnassignmentDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <div
                  className={`text-lg font-medium mb-2 transition-colors ${
                    isDragOver ? "text-orange-600" : "text-orange-600"
                  }`}
                >
                  {isDragOver
                    ? "Drop to unassign assets"
                    : "Drop assets here to unassign"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Drag assets from the assigned assets table above to unassign them from this user
                </div>
                {isReclaiming && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                    <span className="text-sm text-orange-600">
                      Unassigning assets...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disposition Dialog */}
      <DispositionDialog
        open={showDispositionDialog}
        onOpenChange={setShowDispositionDialog}
        onConfirm={handleDispositionConfirm}
        assetNumber={pendingUnassignment?.assetNumber || ""}
        userName={user?.name || ""}
      />
    </div>
  );
}
