// frontend/components/assets/asset-form-with-barcode.tsx
// Example asset form with integrated barcode scanning functionality
// Demonstrates how to use the BarcodeScanner component in asset management

"use client";
import React, { useState } from "react";
import { AssetType, AssetState, AssignmentType } from "@/lib/types";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Asset {
  assetNumber?: string;
  type: AssetType;
  state: AssetState;
  serialNumber: string;
  description: string;
  purchasePrice: string;
  location: string;
  assignmentType: AssignmentType;
  assignedTo?: string;
  employeeId?: string;
  department?: string;
}

interface AssetFormWithBarcodeProps {
  mode: "create" | "edit";
  asset?: Partial<Asset>;
  onSubmit: (asset: Partial<Asset>) => Promise<void>;
}

export function AssetFormWithBarcode({
  mode,
  asset,
  onSubmit,
}: AssetFormWithBarcodeProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    type: AssetType.MOBILE_PHONE,
    state: AssetState.AVAILABLE,
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

  // Handle barcode scan for asset number
  const handleAssetNumberScan = (barcode: string) => {
    console.log("Asset number scanned:", barcode);
    setFormData((prev) => ({ ...prev, assetNumber: barcode }));
  };

  // Handle barcode scan for serial number
  const handleSerialNumberScan = (barcode: string) => {
    console.log("Serial number scanned:", barcode);
    setFormData((prev) => ({ ...prev, serialNumber: barcode }));
  };

  // Handle form field changes
  const handleChange = (
    field: keyof Asset,
    value: string | AssetType | AssetState | AssignmentType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      await onSubmit(formData);
      console.log(`${mode} asset with barcode:`, formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors(["An error occurred while saving the asset"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset Number with Barcode Scanner */}
        <div className="space-y-2">
          <Label htmlFor="assetNumber">Asset Number</Label>
          <BarcodeScanner
            onScan={handleAssetNumberScan}
            placeholder="Scan asset barcode or enter manually..."
            showCameraOption={true}
          />
          {formData.assetNumber && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              Asset Number: {formData.assetNumber}
            </div>
          )}
        </div>

        {/* Asset Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Asset Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value as AssetType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select asset type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AssetType.MOBILE_PHONE}>
                Mobile Phone
              </SelectItem>
              <SelectItem value={AssetType.TABLET}>Tablet</SelectItem>
              <SelectItem value={AssetType.DESKTOP}>Desktop</SelectItem>
              <SelectItem value={AssetType.LAPTOP}>Laptop</SelectItem>
              <SelectItem value={AssetType.MONITOR}>Monitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Serial Number with Barcode Scanner */}
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <BarcodeScanner
            onScan={handleSerialNumberScan}
            placeholder="Scan serial number barcode or enter manually..."
            showCameraOption={true}
          />
          {formData.serialNumber && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              Serial Number: {formData.serialNumber}
            </div>
          )}
        </div>

        {/* Asset State */}
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={formData.state}
            onValueChange={(value) =>
              handleChange("state", value as AssetState)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AssetState.AVAILABLE}>Available</SelectItem>
              <SelectItem value={AssetState.SIGNED_OUT}>Signed Out</SelectItem>
              <SelectItem value={AssetState.BUILT}>Built</SelectItem>
              <SelectItem value={AssetState.READY_TO_GO}>
                Ready To Go
              </SelectItem>
              <SelectItem value={AssetState.ISSUED}>Issued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="e.g., Dell XPS 14 Laptop"
            required
          />
        </div>

        {/* Purchase Price */}
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchasePrice}
            onChange={(e) => handleChange("purchasePrice", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g., Building A, Floor 2"
            required
          />
        </div>

        {/* Assignment Type */}
        <div className="space-y-2">
          <Label htmlFor="assignmentType">Assignment Type</Label>
          <Select
            value={formData.assignmentType}
            onValueChange={(value) =>
              handleChange("assignmentType", value as AssignmentType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assignment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AssignmentType.INDIVIDUAL}>
                Individual
              </SelectItem>
              <SelectItem value={AssignmentType.SHARED}>Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To (for individual assignments) */}
        {formData.assignmentType === AssignmentType.INDIVIDUAL && (
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo || ""}
              onChange={(e) => handleChange("assignedTo", e.target.value)}
              placeholder="Employee name"
            />
          </div>
        )}

        {/* Employee ID (for individual assignments) */}
        {formData.assignmentType === AssignmentType.INDIVIDUAL && (
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId || ""}
              onChange={(e) => handleChange("employeeId", e.target.value)}
              placeholder="Employee ID"
            />
          </div>
        )}

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department || ""}
            onChange={(e) => handleChange("department", e.target.value)}
            placeholder="Department name"
          />
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="text-red-500 text-sm space-y-1">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Asset"
            : "Update Asset"}
        </Button>
      </div>
    </form>
  );
}
