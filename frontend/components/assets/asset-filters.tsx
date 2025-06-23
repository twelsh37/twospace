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
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export type FilterKey = "type" | "state";

export interface FilterState {
  type: AssetType | "all";
  state: AssetState | "all";
}

interface AssetFiltersProps {
  filters: FilterState;
  onFilterChange: (key: FilterKey, value: string) => void;
  onClearFilters: () => void;
}

export function AssetFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: AssetFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all"
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== "all").length;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 gap-2 flex-wrap">
          <Select
            value={filters.type}
            onValueChange={(value) => onFilterChange("type", value)}
          >
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Asset State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {Object.entries(ASSET_STATE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="whitespace-nowrap"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
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
