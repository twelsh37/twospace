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
        // Fetch user details
        const userRes = await fetch(`/api/users/${userId}`);
        const userJson = await userRes.json();
        setUser(userJson.data || null);
        // Fetch assets assigned to this user
        const assetsRes = await fetch(
          `/api/assets?assignedTo=${userJson.data?.name}`
        );
        const assetsJson = await assetsRes.json();
        setAssets(assetsJson.data?.assets || []);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View all information about this user and their assigned assets.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-2">
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Role: {user.role}</Badge>
                <Badge variant="secondary">Department: {user.department}</Badge>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="secondary">
                  Employee ID: {user.employeeId}
                </Badge>
              </div>
            </div>
            {/* Assigned Assets */}
            <div>
              <div className="font-semibold mb-2">Assigned Assets</div>
              {assets.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No assets assigned.
                </div>
              ) : (
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
                        <TableCell>{asset.assetNumber}</TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.state}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-500">User not found.</div>
        )}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
