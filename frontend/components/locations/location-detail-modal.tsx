// frontend/components/locations/location-detail-modal.tsx

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
