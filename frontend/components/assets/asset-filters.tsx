// frontend/components/assets/asset-filters.tsx
// Asset Filters Component for filtering

"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AssetType, AssetState, Location } from "@/lib/types";
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
import { getApiBaseUrl } from "@/lib/config";

type FilterKey = "type" | "state" | "assignmentType" | "locationId";

interface FilterState {
  type: AssetType | "all";
  state: AssetState | "all";
  assignmentType: "INDIVIDUAL" | "SHARED" | "all";
  locationId: string | "all";
}

export function AssetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      let response;
      try {
        response = await fetch(`${getApiBaseUrl()}/api/locations`);
      } catch (error) {
        console.error("Failed to initiate fetch for locations:", error);
        return; // Exit if fetch itself fails
      }

      if (!response.ok) {
        console.error(
          `Failed to fetch locations: ${response.status} ${response.statusText}`
        );
        return; // Exit if response is not OK
      }

      try {
        const { data } = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Failed to parse locations JSON:", error);
      }
    };

    fetchFilterData();
  }, []);

  const filters: FilterState = {
    type: (searchParams.get("type") as AssetType) || "all",
    state: (searchParams.get("state") as AssetState) || "all",
    assignmentType:
      (searchParams.get("assignmentType") as "INDIVIDUAL" | "SHARED") || "all",
    locationId: (searchParams.get("locationId") as string) || "all",
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      params.set("page", "1");
      return params.toString();
    },
    [searchParams]
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 gap-2 flex-wrap">
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

          <Select
            value={filters.locationId}
            onValueChange={(value) => updateFilter("locationId", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          {filters.locationId !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Location:{" "}
              {locations.find((l) => l.id === filters.locationId)?.name ||
                "Unknown"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("locationId", "all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
