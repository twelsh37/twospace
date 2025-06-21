// frontend/components/assets/asset-filters.tsx
// Asset Filters Component for search and filtering

"use client";

import { useState } from "react";
import { AssetType, AssetState } from "@/lib/types";
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface FilterState {
  search: string;
  type: AssetType | "all";
  state: AssetState | "all";
  location: string | "all";
  assignmentType: "INDIVIDUAL" | "SHARED" | "all";
}

export function AssetFilters() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    state: "all",
    location: "all",
    assignmentType: "all",
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // TODO: Apply filters to asset list
    console.log("Filters updated:", { ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      state: "all",
      location: "all",
      assignmentType: "all",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "all"
  );

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(
      ([key, value]) => value !== "" && value !== "all"
    ).length;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Search and Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by asset number, serial number, or description..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2">
          {/* Asset Type Filter */}
          <Select
            value={filters.type}
            onValueChange={(value) => updateFilter("type", value)}
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

          {/* Asset State Filter */}
          <Select
            value={filters.state}
            onValueChange={(value) => updateFilter("state", value)}
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

          {/* Assignment Type Filter */}
          <Select
            value={filters.assignmentType}
            onValueChange={(value) => updateFilter("assignmentType", value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              <SelectItem value="SHARED">Shared</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Active filters ({getActiveFilterCount()}):
          </div>

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("search", "")}
              />
            </Badge>
          )}

          {filters.type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {ASSET_TYPE_LABELS[filters.type as AssetType]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("type", "all")}
              />
            </Badge>
          )}

          {filters.state !== "all" && (
            <Badge variant="secondary" className="gap-1">
              State: {ASSET_STATE_LABELS[filters.state as AssetState]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("state", "all")}
              />
            </Badge>
          )}

          {filters.assignmentType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Assignment: {filters.assignmentType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("assignmentType", "all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
