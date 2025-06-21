// frontend/components/assets/asset-form.tsx
// Asset Form Component for creating and editing assets

"use client";

import { useState } from "react";
import { Asset, AssetType } from "@/lib/types";
import { ASSET_TYPE_LABELS, INITIAL_LOCATIONS } from "@/lib/constants";
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
    purchasePrice: 0,
    location: "",
    assignmentType: "INDIVIDUAL",
    assignedTo: "",
    employeeId: "",
    department: "",
    ...asset,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateAsset(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // TODO: Replace with actual API call
      if (onSubmit) {
        await onSubmit(formData);
      }
      console.log(`${mode} asset:`, formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form if creating new asset
      if (mode === "create") {
        setFormData({
          type: AssetType.MOBILE_PHONE,
          serialNumber: "",
          description: "",
          purchasePrice: 0,
          location: "",
          assignmentType: "INDIVIDUAL",
          assignedTo: "",
          employeeId: "",
          department: "",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors(["An error occurred while saving the asset"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof Asset, value: any) => {
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
              value={formData.purchasePrice || 0}
              onChange={(e) =>
                updateField("purchasePrice", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => updateField("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {INITIAL_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Type */}
          <div className="space-y-2">
            <Label>Assignment Type</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="individual"
                checked={formData.assignmentType === "INDIVIDUAL"}
                onCheckedChange={(checked) =>
                  updateField(
                    "assignmentType",
                    checked ? "INDIVIDUAL" : "SHARED"
                  )
                }
              />
              <Label htmlFor="individual">Individual Assignment</Label>
            </div>
          </div>

          {/* Assignment Details (if individual) */}
          {formData.assignmentType === "INDIVIDUAL" && (
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
