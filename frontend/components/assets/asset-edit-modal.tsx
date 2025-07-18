"use client";

import { useEffect, useState } from "react";
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
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { AssetType, AssetState } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface AssetEditModalProps {
  assetNumber: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

interface Asset {
  assetNumber: string;
  type: AssetType;
  state: AssetState;
  serialNumber: string;
  description: string;
  purchasePrice: string;
  location: string;
  department?: string;
  assignedTo?: string;
  employeeId?: string;
}

export function AssetEditModal({
  assetNumber,
  open,
  onOpenChange,
  onUpdated,
}: AssetEditModalProps) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<Partial<Asset>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth(); // Get session from auth context

  useEffect(() => {
    if (!assetNumber || !open) return;
    setLoading(true);
    setError(null);
    async function fetchAsset() {
      try {
        const res = await fetch(`/api/assets/${assetNumber}`);
        const json = await res.json();
        setAsset(json.data || null);
        setForm(json.data || {});
      } catch {
        setAsset(null);
        setForm({});
        setError("Failed to load asset data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetNumber, open]);

  // Track if form is dirty
  const isDirty =
    asset &&
    Object.keys(form).some(
      (key) =>
        (form as Record<string, unknown>)[key] !==
        (asset as unknown as Record<string, unknown>)[key]
    );

  const handleChange = (
    key: keyof Asset,
    value: string | AssetType | AssetState
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNumber || !isDirty) return;
    setSaving(true);
    setError(null);
    try {
      // Attach Authorization header if access token is available
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/assets/${assetNumber}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update asset");
      if (onUpdated) onUpdated();
      onOpenChange(false);
    } catch {
      setError("Failed to update asset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg bg-white rounded-lg shadow-xl p-8"
        hideClose
      >
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update asset details. Only fields from the asset table are editable.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : asset ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">
                Asset Number
              </label>
              <Input value={asset.assetNumber} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={form.type || asset.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Select
                value={form.state || asset.state}
                onValueChange={(value) => handleChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_STATE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Serial Number
              </label>
              <Input
                value={form.serialNumber || ""}
                onChange={(e) => handleChange("serialNumber", e.target.value)}
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
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Purchase Price
              </label>
              <Input
                type="number"
                value={form.purchasePrice || ""}
                onChange={(e) => handleChange("purchasePrice", e.target.value)}
                required
              />
            </div>
            {/* Add more fields as needed, e.g., location, department, assignedTo, employeeId */}
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
                {saving ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center text-red-500">
            {error || "Asset not found."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
