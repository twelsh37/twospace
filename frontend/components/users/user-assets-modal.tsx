// frontend/components/users/user-assets-modal.tsx

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ASSET_STATE_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import { AssetState, AssetType } from "@/lib/types";
import Link from "next/link";

interface UserAssetsModalProps {
  employeeId: string | null;
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

export function UserAssetsModal({
  employeeId,
  open,
  onOpenChange,
}: UserAssetsModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId || !open) return;

    setLoading(true);
    setError(null);

    async function fetchUserAndAssets() {
      try {
        // Fetch user details and assets by employee ID
        const userRes = await fetch(`/api/users/by-employee-id/${employeeId}`);

        if (!userRes.ok) {
          if (userRes.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load user data");
          }
          setUser(null);
          setAssets([]);
          return;
        }

        const userJson = await userRes.json();
        setUser(userJson.data || null);
        setAssets(userJson.assets || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        setUser(null);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndAssets();
  }, [employeeId, open]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Assets</DialogTitle>
          <DialogDescription>
            View user details and all assets assigned to this user.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center">Loading user data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Location: {user.location}</Badge>
                <Badge variant="secondary">Department: {user.department}</Badge>
                <Badge variant="secondary">
                  Employee ID: {user.employeeId}
                </Badge>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Assigned Assets Section */}
            <div>
              <div className="font-semibold mb-3 text-lg">
                Assigned Assets ({assets.length})
              </div>
              {assets.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  No assets assigned to this user.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.assetNumber}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/assets/${asset.assetNumber}`}
                              className="hover:underline text-blue-600"
                            >
                              {asset.assetNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {ASSET_TYPE_LABELS[asset.type as AssetType] ||
                              asset.type}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {asset.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStateColorClass(
                                asset.state as AssetState
                              )}
                            >
                              {ASSET_STATE_LABELS[asset.state as AssetState] ||
                                asset.state}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-500">User not found.</div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
