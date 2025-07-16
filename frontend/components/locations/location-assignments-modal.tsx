// frontend/components/locations/location-assignments-modal.tsx
// Modal to show users and assets assigned to a location

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Asset } from "@/types/asset";
import { useAuth } from "@/lib/auth-context";

interface LocationAssignmentsModalProps {
  locationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationAssignmentsModal({
  locationId,
  open,
  onOpenChange,
}: LocationAssignmentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  // Pagination state
  const [userPage, setUserPage] = useState(1);
  const [assetPage, setAssetPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [userTotal, setUserTotal] = useState(0);
  const [assetTotal, setAssetTotal] = useState(0);
  const { session } = useAuth(); // Get session from auth context

  // Fetch assignments for the current page
  useEffect(() => {
    if (!open || !locationId) return;
    setLoading(true);
    setError(null);
    // Attach Authorization header if access token is available
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    fetch(
      `/api/locations/${locationId}/assignments?userPage=${userPage}&userLimit=${ITEMS_PER_PAGE}&assetPage=${assetPage}&assetLimit=${ITEMS_PER_PAGE}`,
      { headers }
    )
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setAssets(data.assets || []);
        setUserTotal(data.userTotal || 0);
        setAssetTotal(data.assetTotal || 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assignments");
        setLoading(false);
      });
  }, [open, locationId, userPage, assetPage, session]);

  // Reset pages when location changes
  useEffect(() => {
    setUserPage(1);
    setAssetPage(1);
  }, [locationId, open]);

  const userTotalPages = Math.max(1, Math.ceil(userTotal / ITEMS_PER_PAGE));
  const assetTotalPages = Math.max(1, Math.ceil(assetTotal / ITEMS_PER_PAGE));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Location Assignments</DialogTitle>
          <DialogDescription>
            Users and assets assigned to this location.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Users Card */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading users...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : users.length === 0 ? (
                  <div>No users assigned to this location.</div>
                ) : (
                  <ul className="mb-2">
                    {users.map((user) => (
                      <li key={user.id}>
                        {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                )}
                {/* Pagination controls for users */}
                {userTotalPages > 1 && (
                  <div className="flex items-center gap-2 justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs">
                      Page {userPage} of {userTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setUserPage((p) => Math.min(userTotalPages, p + 1))
                      }
                      disabled={userPage === userTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Assets Card */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading assets...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : assets.length === 0 ? (
                  <div>No assets assigned to this location.</div>
                ) : (
                  <ul className="mb-2">
                    {assets.map((asset) => (
                      <li key={asset.id}>
                        {asset.type}: {asset.description}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Pagination controls for assets */}
                {assetTotalPages > 1 && (
                  <div className="flex items-center gap-2 justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                      disabled={assetPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs">
                      Page {assetPage} of {assetTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAssetPage((p) => Math.min(assetTotalPages, p + 1))
                      }
                      disabled={assetPage === assetTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
