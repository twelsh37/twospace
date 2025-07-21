// frontend/components/users/user-detail-modal.tsx

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

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AssignAssetsDrawer } from "./assign-assets-drawer";
import { useAuth } from "@/lib/auth-context";

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function UserDetailModal({
  userId,
  open,
  onOpenChange,
}: UserDetailModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const [isAssigningAsset, setIsAssigningAsset] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(
    null
  );
  const [drawerRefreshTrigger, setDrawerRefreshTrigger] = useState(0);

  // Get auth context for API calls
  const { session } = useAuth();

  useEffect(() => {
    if (!userId || !open || !session?.access_token) return;
    setLoading(true);
    async function fetchUserAndAssets() {
      if (!session?.access_token) {
        console.error("UserDetailModal: No session or access token available");
        setUser(null);
        setAssets([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch user details and assets in one call
        const userRes = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const userJson = await userRes.json();
        console.log("User API response:", userJson);

        if (userJson.success && userJson.data) {
          setUser(userJson.data);
          // Fetch user's assets separately
          const assetsRes = await fetch(`/api/users/${userId}/assets`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          const assetsJson = await assetsRes.json();
          console.log("Assets API response:", assetsJson);

          if (assetsJson.success && assetsJson.assets) {
            setAssets(assetsJson.assets);
          } else {
            console.error("Failed to fetch assets:", assetsJson);
            setAssets([]);
          }
        } else {
          setUser(null);
          setAssets([]);
        }
      } catch {
        setUser(null);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndAssets();
  }, [userId, open, session]);

  // Reset drawer state when modal closes
  useEffect(() => {
    if (!open) {
      setIsAssignDrawerOpen(false);
      setShowDropZone(false);
      setAssignmentSuccess(null);
      setDrawerRefreshTrigger(0);
    }
  }, [open]);

  // Handle Assign Assets button click
  const handleAssignAssets = () => {
    console.log("UserDetailModal: Assign Assets button clicked");
    console.log("UserDetailModal: Setting isAssignDrawerOpen to true");
    setIsAssignDrawerOpen(true);
    setShowDropZone(true);
  };

  // Handle asset assignment - refresh user's assets
  const handleAssetAssigned = async () => {
    if (!userId || !session?.access_token) return;

    try {
      console.log("Refreshing user assets for userId:", userId);
      const assetsRes = await fetch(`/api/users/${userId}/assets`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!assetsRes.ok) {
        console.error(
          "Failed to fetch user assets:",
          assetsRes.status,
          assetsRes.statusText
        );
        return;
      }

      const assetsJson = await assetsRes.json();
      console.log("Received assets data:", assetsJson);

      if (assetsJson.success && assetsJson.assets) {
        setAssets(assetsJson.assets);
        console.log("Updated assets state with:", assetsJson.assets);
      } else {
        console.error("Invalid response format:", assetsJson);
        setAssets([]);
      }
    } catch (error) {
      console.error("Failed to refresh user assets:", error);
      setAssets([]);
    }
  };

  // If not open, don't render anything
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[10vh] z-50">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Loading State - Show spinner until all data is ready */}
        {loading ? (
          <Card className="shadow-2xl border rounded-xl bg-white relative overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                User Details
              </CardTitle>
              <CardDescription>
                View all information about this user and their assigned assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-sm text-gray-600">
                    Loading user details...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : user ? (
          /* User Details Card - Only render when data is ready */
          <Card className="shadow-2xl border rounded-xl bg-white relative overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                User Details
              </CardTitle>
              <CardDescription>
                View all information about this user and their assigned assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-2">
                  <div className="text-lg font-semibold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="secondary">Location: {user.location}</Badge>
                    <Badge variant="secondary">
                      Department: {user.department}
                    </Badge>
                    <Badge variant="secondary">
                      Employee ID: {user.employeeId}
                    </Badge>
                  </div>
                </div>
                {/* Success Message */}
                {assignmentSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="text-green-800 text-sm font-medium">
                      ✅ {assignmentSuccess}
                    </div>
                  </div>
                )}

                {/* Assigned Assets */}
                <div>
                  <div className="font-semibold mb-2">Assigned Assets</div>
                  <div className="max-h-60 overflow-y-auto">
                    {assets.length === 0 && (
                      <div className="text-muted-foreground text-sm">
                        No assets assigned.
                      </div>
                    )}

                    {/* Drop Zone - Appears when Assign Assets is clicked */}
                    {showDropZone && (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                          isAssigningAsset
                            ? "border-blue-500 bg-blue-50"
                            : "border-green-500 bg-green-50"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add(
                            "bg-green-100",
                            "border-green-600"
                          );
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove(
                            "bg-green-100",
                            "border-green-600"
                          );
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "bg-green-100",
                            "border-green-600"
                          );

                          // Prevent assignment if already in progress
                          if (isAssigningAsset) {
                            console.log(
                              "Asset assignment already in progress, ignoring drop"
                            );
                            return;
                          }

                          // Get the dropped asset data
                          const assetData =
                            e.dataTransfer.getData("text/plain");
                          console.log("Dropped asset data:", assetData);

                          if (!assetData || !userId || !session?.access_token) {
                            console.error(
                              "Missing required data for assignment:",
                              {
                                hasAssetData: !!assetData,
                                hasUserId: !!userId,
                                hasToken: !!session?.access_token,
                              }
                            );
                            return;
                          }

                          try {
                            setIsAssigningAsset(true);
                            setAssignmentSuccess(null); // Clear any previous success message
                            const parsedData = JSON.parse(assetData);
                            console.log(
                              "Parsed data for assignment:",
                              parsedData
                            );

                            // Check if it's a single asset or multiple assets
                            const assetsToAssign = Array.isArray(parsedData)
                              ? parsedData
                              : [parsedData];
                            console.log("Assets to assign:", assetsToAssign);

                            // Assign all assets
                            const assignmentPromises = assetsToAssign.map(
                              async (asset) => {
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

                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(
                                    `Failed to assign ${asset.assetNumber}: ${
                                      errorData.error || response.statusText
                                    }`
                                  );
                                }

                                return { asset, success: true };
                              }
                            );

                            // Wait for all assignments to complete
                            const results = await Promise.allSettled(
                              assignmentPromises
                            );
                            const successfulAssignments = results
                              .filter(
                                (
                                  result
                                ): result is PromiseFulfilledResult<{
                                  asset: { assetNumber: string };
                                  success: boolean;
                                }> =>
                                  result.status === "fulfilled" &&
                                  result.value.success
                              )
                              .map((result) => result.value.asset);

                            const failedAssignments = results
                              .filter(
                                (result): result is PromiseRejectedResult =>
                                  result.status === "rejected"
                              )
                              .map((result) => result.reason);

                            console.log("Assignment results:", {
                              successfulAssignments,
                              failedAssignments,
                            });

                            if (successfulAssignments.length > 0) {
                              // Add a small delay to ensure database is updated
                              await new Promise((resolve) =>
                                setTimeout(resolve, 500)
                              );

                              // Refresh user's assets
                              await handleAssetAssigned();
                              // Refresh drawer to remove assigned assets
                              setDrawerRefreshTrigger((prev) => prev + 1);

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

                              // Hide drop zone after successful assignment
                              setShowDropZone(false);

                              // Clear success message after 3 seconds
                              setTimeout(() => {
                                setAssignmentSuccess(null);
                              }, 3000);
                            }

                            if (failedAssignments.length > 0) {
                              console.error(
                                "Some assignments failed:",
                                failedAssignments
                              );
                              // You could show an error message here if needed
                            }
                          } catch (error) {
                            console.error("Error assigning assets:", error);
                          } finally {
                            setIsAssigningAsset(false);
                          }
                        }}
                      >
                        {isAssigningAsset ? (
                          <>
                            <div className="text-blue-600 font-semibold mb-2">
                              Assigning Assets...
                            </div>
                            <div className="text-blue-500 text-sm">
                              Please wait while the assets are being assigned
                            </div>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mt-2"></div>
                          </>
                        ) : (
                          <>
                            <div className="text-green-600 font-semibold mb-2">
                              Drop Assets Here
                            </div>
                            <div className="text-green-500 text-sm">
                              Drag single or multiple assets from the drawer
                              below
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {assets.length > 0 && (
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "separate",
                          borderSpacing: 0,
                          borderRadius: "12px",
                          overflow: "hidden",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                          fontSize: "12px",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              background: "#1d4ed8",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "1rem",
                            }}
                          >
                            <th
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                borderTopLeftRadius: "12px",
                                textAlign: "left",
                              }}
                            >
                              Asset Number
                            </th>
                            <th
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                textAlign: "left",
                              }}
                            >
                              Type
                            </th>
                            <th
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                textAlign: "left",
                              }}
                            >
                              Description
                            </th>
                            <th
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                borderTopRightRadius: "12px",
                                textAlign: "left",
                              }}
                            >
                              State
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {assets.map((asset, idx) => (
                            <tr
                              key={asset.assetNumber}
                              style={{
                                background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                transition: "background 0.2s",
                              }}
                            >
                              <td
                                style={{
                                  padding: "0.25rem",
                                  border: "none",
                                  textAlign: "left",
                                  fontWeight: 500,
                                }}
                              >
                                {asset.assetNumber}
                              </td>
                              <td
                                style={{
                                  padding: "0.25rem",
                                  border: "none",
                                  textAlign: "left",
                                }}
                              >
                                {asset.type}
                              </td>
                              <td
                                style={{
                                  padding: "0.25rem",
                                  border: "none",
                                  textAlign: "left",
                                }}
                              >
                                {asset.description}
                              </td>
                              <td
                                style={{
                                  padding: "0.25rem",
                                  border: "none",
                                  textAlign: "left",
                                }}
                              >
                                {asset.state}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4">
              <Button onClick={handleAssignAssets}>Assign Assets</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </CardFooter>

            {/* Animated Drawer - Slides down from the User Details card (never detaches) */}
            <div
              className={`absolute left-0 right-0 bg-white border border-gray-200 shadow-2xl transform transition-all duration-1000 ease-in-out ${
                isAssignDrawerOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
              style={{
                top: "100%",
                height: "50vh",
                maxHeight: "50vh",
                zIndex: 10,
                marginTop: "0",
                borderTopLeftRadius: "0",
                borderTopRightRadius: "0",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Assign Assets</h3>
                  <button
                    onClick={() => {
                      console.log("UserDetailModal: Closing drawer");
                      setIsAssignDrawerOpen(false);
                      setShowDropZone(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Select assets to assign to this user.
                </div>
                <AssignAssetsDrawer
                  isOpen={isAssignDrawerOpen}
                  onClose={() => {
                    console.log("UserDetailModal: Closing drawer");
                    setIsAssignDrawerOpen(false);
                    setShowDropZone(false);
                  }}
                  userId={userId || ""}
                  onAssetAssigned={handleAssetAssigned}
                  refreshTrigger={drawerRefreshTrigger}
                />
              </div>
            </div>
          </Card>
        ) : (
          /* Error State - User not found */
          <Card className="shadow-2xl border rounded-xl bg-white relative overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                User Details
              </CardTitle>
              <CardDescription>
                View all information about this user and their assigned assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="p-8 text-center text-red-500">
                User not found.
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
