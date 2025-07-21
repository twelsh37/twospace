// frontend/components/assets/asset-form.tsx

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

import { useState, useEffect } from "react";
import { Asset, AssetType, AssetState } from "@/lib/types";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import { validateAsset } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Save, Loader2 } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

// Remove assignment-related props from AssetFormProps
type AssetFormProps = {
  mode: "create" | "edit";
  asset?: Partial<Asset>;
  onSubmit?: (asset: Partial<Asset>) => Promise<void>;
  onCancel?: () => void; // Optional cancel handler
  session?: { access_token?: string } | null; // Add session prop for auth
};

export function AssetForm({
  mode,
  asset,
  onSubmit,
  onCancel,
  session,
}: AssetFormProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    type: AssetType.MOBILE_PHONE,
    state: AssetState.AVAILABLE, // Set default state to Available Stock
    serialNumber: "",
    description: "",
    purchasePrice: "", // Start empty, not 0
    location: "",
    ...asset,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    []
  );
  const [assetNumber, setAssetNumber] = useState("");
  const [suggestedAssetNumber, setSuggestedAssetNumber] = useState("");

  // Fetch locations from the API on mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setLocations(
            json.data.map((l: { id: string; name: string }) => ({
              id: l.id,
              name: l.name,
            }))
          );
        } else {
          setLocations([]);
        }
      } catch {
        setLocations([]);
      }
    }
    fetchLocations();
  }, []);

  // Fetch suggested asset number when type changes
  useEffect(() => {
    async function fetchSuggestedAssetNumber() {
      if (!formData.type) return;
      try {
        const res = await fetch(
          `/api/assets/next-asset-number?type=${formData.type}`
        );
        const json = await res.json();
        if (json.success && json.assetNumber) {
          setSuggestedAssetNumber(json.assetNumber);
          // Only set if user hasn't typed anything
          if (!assetNumber) setAssetNumber(json.assetNumber);
        }
      } catch {
        setSuggestedAssetNumber("");
      }
    }
    fetchSuggestedAssetNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form data
    const validationErrors = validateAsset(formData);
    if (!assetNumber) validationErrors.push("Asset number is required");
    if (assetNumber.length > 10)
      validationErrors.push("Asset number must be 10 characters or less");
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      showErrorToast(validationErrors[0]); // Show first error as toast
      return;
    }
    setIsSubmitting(true);
    setErrors([]);
    try {
      // Send assetNumber to API
      const submitData = {
        ...formData,
        locationId: formData.location, // location holds the id now
        assetNumber,
      };
      if (onSubmit) {
        await onSubmit(submitData);
      } else if (mode === "create") {
        // If no onSubmit provided, handle API call here (for /assets/new page)
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/assets", {
          method: "POST",
          headers,
          body: JSON.stringify(submitData),
        });
        if (!res.ok) {
          let errorMsg = "Failed to add asset. Please try again.";
          try {
            const errorJson = await res.json();
            if (errorJson && (errorJson.error || errorJson.details)) {
              errorMsg = errorJson.error || errorJson.details;
            }
          } catch {}
          setErrors([errorMsg]);
          showErrorToast(errorMsg);
          setIsSubmitting(false);
          return;
        }
      }
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success toast
      showSuccessToast("Asset added successfully!");

      // Reset form if creating new asset
      if (mode === "create") {
        setFormData({
          type: AssetType.MOBILE_PHONE,
          state: AssetState.AVAILABLE, // Reset to Available Stock
          serialNumber: "",
          description: "",
          purchasePrice: "",
          location: "",
        });
        setAssetNumber("");
        setSuggestedAssetNumber("");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = "An error occurred while saving the asset";
      setErrors([errorMessage]);
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (
    field: keyof Asset,
    value: string | number | AssetType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="text-sm text-destructive">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Asset Type */}
      {/* Reduced margin-top to halve the space above the asset type dropdown */}
      <div className="space-y-2 mt-2">
        <Label htmlFor="type">Asset Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => updateField("type", value as AssetType)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select asset type" />
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

      {/* Asset Number (user input, can scan or type) */}
      <div className="space-y-2">
        <Label htmlFor="assetNumber">Asset Number *</Label>
        <Input
          id="assetNumber"
          value={assetNumber}
          onChange={(e) => setAssetNumber(e.target.value)}
          placeholder={suggestedAssetNumber || "Scan or enter asset number"}
          autoComplete="off"
          maxLength={10}
          disabled={isSubmitting}
        />
        {suggestedAssetNumber && (
          <div className="text-xs text-muted-foreground mt-1">
            Suggested: {suggestedAssetNumber} (can override)
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          Maximum 10 characters
        </div>
      </div>

      {/* Serial Number */}
      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serial Number *</Label>
        <Input
          id="serialNumber"
          value={formData.serialNumber || ""}
          onChange={(e) => updateField("serialNumber", e.target.value)}
          placeholder="Enter serial number"
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      {/* Changed from Textarea to single-line Input as per user request */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={formData.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Enter asset description"
          maxLength={100}
          disabled={isSubmitting}
        />
      </div>

      {/* Purchase Price */}
      <div className="space-y-2">
        <Label htmlFor="purchasePrice">Purchase Price *</Label>
        <Input
          id="purchasePrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.purchasePrice || ""}
          onChange={(e) => updateField("purchasePrice", e.target.value)}
          placeholder="Enter asset cost" // Updated placeholder
          disabled={isSubmitting}
        />
      </div>

      {/* Location */}
      <div className="space-y-2 flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="location">Location *</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => updateField("location", value)}
            disabled={locations.length === 0 || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* If no locations, show a message below the dropdown */}
          {locations.length === 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              No locations available. Please add a location first.
            </div>
          )}
        </div>
        {/* Action Buttons: Now aligned with Location dropdown */}
        <div className="flex gap-2 pb-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel ? onCancel : undefined} // Use onCancel if provided
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === "create" ? "Create Asset" : "Update Asset"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
