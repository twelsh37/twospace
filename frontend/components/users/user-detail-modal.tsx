"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    async function fetchUserAndAssets() {
      try {
        // Fetch user details and assets in one call
        const userRes = await fetch(`/api/users/${userId}`);
        const userJson = await userRes.json();
        setUser(userJson.data || null);
        setAssets(userJson.assets || []);
      } catch {
        setUser(null);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndAssets();
  }, [userId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" hideClose={true}>
        {/* Visually hidden DialogTitle for accessibility */}
        <DialogTitle asChild>
          <VisuallyHidden>User Details</VisuallyHidden>
        </DialogTitle>
        <Card className="shadow-lg border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              View all information about this user and their assigned assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : user ? (
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
                {/* Assigned Assets */}
                <div>
                  <div className="font-semibold mb-2">Assigned Assets</div>
                  <div className="max-h-80 overflow-y-auto">
                    {assets.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        No assets assigned.
                      </div>
                    ) : (
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
            ) : (
              <div className="p-8 text-center text-red-500">
                User not found.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
