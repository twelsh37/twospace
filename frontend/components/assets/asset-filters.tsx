// frontend/components/assets/asset-filters.tsx
// Asset Filters Component for filtering

"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { AssetsPageProps } from "@/app/assets/page";

type FilterKey = "type" | "state" | "assignmentType";

interface FilterState {
  type: AssetType | "all";
  state: AssetState | "all";
  assignmentType: "INDIVIDUAL" | "SHARED" | "all";
}

export function AssetFilters({ searchParams }: AssetsPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterState = {
    type: (searchParams?.type as AssetType) || "all",
    state: (searchParams?.state as AssetState) || "all",
    assignmentType:
      (searchParams?.assignmentType as "INDIVIDUAL" | "SHARED") || "all",
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      // Create a new URLSearchParams object from the current filters
      // to avoid carrying over any unexpected query parameters.
      const currentParams: Record<string, string> = {};
      if (filters.type !== "all") currentParams.type = filters.type;
      if (filters.state !== "all") currentParams.state = filters.state;
      if (filters.assignmentType !== "all") {
        currentParams.assignmentType = filters.assignmentType;
      }

      const params = new URLSearchParams(currentParams);

      // Update the parameter that changed
      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      // Reset page to 1 when filters change
      params.set("page", "1");
      return params.toString();
    },
    [filters]
  );

  const updateFilter = (key: FilterKey, value: string) => {
    router.push(pathname + "?" + createQueryString(key, value));
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all"
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== "all").length;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Dropdowns */}
        <div className="flex flex-1 gap-2">
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
              Assignment:{" "}
              {filters.assignmentType === "INDIVIDUAL"
                ? "Individual"
                : "Shared"}
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
