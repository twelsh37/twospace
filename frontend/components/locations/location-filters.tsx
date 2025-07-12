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
  location: string; // Use 'ALL' for all locations
  isActive: string; // Use 'ALL' for all statuses
};

type Props = {
  filters: LocationFilterState;
  onFilterChange: (key: keyof LocationFilterState, value: string) => void;
  onClearFilters: () => void;
};

// Define a type for location objects
interface LocationOption {
  id: string;
  name: string;
}

export function LocationFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: Props) {
  const [locations, setLocations] = useState<LocationOption[]>([]);

  useEffect(() => {
    // Fetch unique locations from the API
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const validLocations = json.data.filter(
            (l: unknown) =>
              l &&
              typeof l === "object" &&
              typeof (l as { id?: unknown }).id === "string" &&
              typeof (l as { name?: unknown }).name === "string"
          );
          setLocations(validLocations);
        } else {
          setLocations([]);
        }
      } catch {
        setLocations([]);
      }
    }
    fetchLocations();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      {/* Location Filter */}
      <Select
        value={filters.location || "ALL"}
        onValueChange={(value) => onFilterChange("location", value || "ALL")}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={loc.id}>
              {loc.name.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.isActive || "ALL"}
        onValueChange={(value) => onFilterChange("isActive", value || "ALL")}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
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
