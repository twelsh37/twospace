// frontend/components/locations/location-detail-modal.tsx
// Modal for viewing location details

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface LocationDetailModalProps {
  locationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Location {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export function LocationDetailModal({
  locationId,
  open,
  onOpenChange,
}: LocationDetailModalProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationId || !open) return;
    setLoading(true);
    async function fetchLocation() {
      try {
        const res = await fetch(`/api/locations/${locationId}`);
        const json = await res.json();
        setLocation(json.data || null);
      } catch {
        setLocation(null);
      } finally {
        setLoading(false);
      }
    }
    fetchLocation();
  }, [locationId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Location Details</DialogTitle>
          <DialogDescription>
            View all information about this location.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : location ? (
          <div className="space-y-4">
            <div className="text-lg font-semibold">{location.name}</div>
            <div className="text-sm text-muted-foreground">
              {location.description || "No description."}
            </div>
            <div className="flex gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <span>{location.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-500">
            Location not found.
          </div>
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
