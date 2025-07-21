// frontend/components/locations/location-edit-modal.tsx

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

// Modal for editing location details

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface LocationEditModalProps {
  locationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

interface Location {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export function LocationEditModal({
  locationId,
  open,
  onOpenChange,
  onUpdated,
}: LocationEditModalProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [form, setForm] = useState<Partial<Location>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId || !open) return;
    setLoading(true);
    setError(null);
    async function fetchLocation() {
      try {
        const res = await fetch(`/api/locations/${locationId}`);
        const json = await res.json();
        setLocation(json.data || null);
        setForm(json.data || {});
      } catch {
        setLocation(null);
        setForm({});
        setError("Failed to load location data.");
      } finally {
        setLoading(false);
      }
    }
    fetchLocation();
  }, [locationId, open]);

  const isDirty =
    location &&
    Object.keys(form).some(
      (key) =>
        (form as Record<string, unknown>)[key] !==
        (location as unknown as Record<string, unknown>)[key]
    );

  const handleChange = (key: keyof Location, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !isDirty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/locations/${locationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update location");
      if (onUpdated) onUpdated();
      onOpenChange(false);
    } catch {
      setError("Failed to update location.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>
            Update location details. Only fields from the table are editable.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : location ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={form.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={form.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  handleChange("isActive", value === "true")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty || saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center text-red-500">
            Location not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
