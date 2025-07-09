// frontend/components/assets/asset-form.tsx
// Asset Form Component for creating and editing assets

"use client";

import { useState, useEffect } from "react";
import { Asset, AssetType, AssignmentType } from "@/lib/types";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import { validateAsset } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";

interface AssetFormProps {
  mode: "create" | "edit";
  asset?: Partial<Asset>;
  onSubmit?: (asset: Partial<Asset>) => Promise<void>;
}

export function AssetForm({ mode, asset, onSubmit }: AssetFormProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    type: AssetType.MOBILE_PHONE,
    serialNumber: "",
    description: "",
    purchasePrice: "0",
    location: "",
    assignmentType: AssignmentType.INDIVIDUAL,
    assignedTo: "",
    employeeId: "",
    department: "",
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
          setLocations(json.data.map((l: any) => ({ id: l.id, name: l.name })));
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
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
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
      }
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Reset form if creating new asset
      if (mode === "create") {
        setFormData({
          type: AssetType.MOBILE_PHONE,
          serialNumber: "",
          description: "",
          purchasePrice: "0",
          location: "",
          assignmentType: AssignmentType.INDIVIDUAL,
          assignedTo: "",
          employeeId: "",
          department: "",
        });
        setAssetNumber("");
        setSuggestedAssetNumber("");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors(["An error occurred while saving the asset"]);
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
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create New Asset" : "Edit Asset"}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-2">
            <Label htmlFor="type">Asset Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateField("type", value as AssetType)}
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
            />
            {suggestedAssetNumber && (
              <div className="text-xs text-muted-foreground mt-1">
                Suggested: {suggestedAssetNumber} (can override)
              </div>
            )}
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber || ""}
              onChange={(e) => updateField("serialNumber", e.target.value)}
              placeholder="Enter serial number"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter asset description"
              rows={3}
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
              value={formData.purchasePrice || "0"}
              onChange={(e) => updateField("purchasePrice", e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => updateField("location", value)}
              disabled={locations.length === 0}
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

          {/* Assignment Type */}
          <div className="space-y-2">
            <Label>Assignment Type</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="individual"
                checked={formData.assignmentType === AssignmentType.INDIVIDUAL}
                onCheckedChange={(checked) =>
                  updateField(
                    "assignmentType",
                    checked ? AssignmentType.INDIVIDUAL : AssignmentType.SHARED
                  )
                }
              />
              <Label htmlFor="individual">Individual Assignment</Label>
            </div>
          </div>

          {/* Assignment Details (if individual) */}
          {formData.assignmentType === AssignmentType.INDIVIDUAL && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Assignment Details</h4>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                  placeholder="Employee name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId || ""}
                  onChange={(e) => updateField("employeeId", e.target.value)}
                  placeholder="Employee ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="Department"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
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
        </form>
      </CardContent>
    </Card>
  );
}
