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

// Removed unused LocationOption interface to resolve ESLint error
// interface LocationOption {
//   id: string;
//   name: string;
// }

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
  // Always show the Clear Filters button for better UX
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.type || "ALL"}
            onValueChange={(value) => onFilterChange("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key.toUpperCase()}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.state || "ALL"}
            onValueChange={(value) => onFilterChange("state", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All States</SelectItem>
              {Object.entries(ASSET_STATE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key.toUpperCase()}>
                  <Badge className={getStateColorClass(key as AssetState)}>
                    {label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="HOLDING">Holding</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="STOCK">Stock</SelectItem>
              <SelectItem value="RECYCLED">Recycled</SelectItem>
              <SelectItem value="REPAIR">Repair</SelectItem>
            </SelectContent>
          </Select>

          {/* Always show the Clear Filters button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Removed active filter badges and label as per user request */}
    </div>
  );
}
