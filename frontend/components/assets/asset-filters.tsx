// frontend/components/assets/asset-filters.tsx
// Asset Filters Component for filtering

"use client";

import { AssetType, AssetState } from "@/lib/types";
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type FilterKey = "type" | "state" | "status";

export interface FilterState {
  type: AssetType | "all";
  state: AssetState | "all";
  status: string | "all";
}

interface AssetFiltersProps {
  filters: FilterState;
  onFilterChange: (key: FilterKey, value: string) => void;
  onClearFilters: () => void;
}

// Utility function to map asset state to solid background color classes
const getStateColorClass = (state: AssetState) => {
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white";
    case AssetState.BUILDING:
      return "bg-orange-500 text-white";
    case AssetState.READY_TO_GO:
      return "bg-purple-600 text-white";
    case AssetState.ISSUED:
      return "bg-green-600 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

export function AssetFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: AssetFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all"
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.type}
            onValueChange={(value) => onFilterChange("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.state}
            onValueChange={(value) => onFilterChange("state", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Asset State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {Object.entries(ASSET_STATE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <Badge className={getStateColorClass(key as AssetState)}>
                    {label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Asset Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="holding">Holding (Imported)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Removed active filter badges and label as per user request */}
        </div>
      )}
    </div>
  );
}
