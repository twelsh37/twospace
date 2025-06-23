// frontend/components/locations/location-filters.tsx
// Filter bar for locations page

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type LocationFilterState = {
  location: string;
  isActive: string; // "all" | "true" | "false"
};

type Props = {
  filters: LocationFilterState;
  onFilterChange: (key: keyof LocationFilterState, value: string) => void;
  onClearFilters: () => void;
};

export function LocationFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: Props) {
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    // Fetch unique locations from the API
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        const json = await res.json();
        type Location = { name: string };
        if (json.data && Array.isArray(json.data)) {
          setLocations(["all", ...json.data.map((l: Location) => l.name)]);
        } else {
          setLocations(["all"]);
        }
      } catch {
        setLocations(["all"]);
      }
    }
    fetchLocations();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      {/* Location Filter */}
      <Select
        value={filters.location}
        onValueChange={(value) => onFilterChange("location", value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations
            .filter((l) => l !== "all")
            .map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.isActive}
        onValueChange={(value) => onFilterChange("isActive", value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      <Button variant="outline" size="sm" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
