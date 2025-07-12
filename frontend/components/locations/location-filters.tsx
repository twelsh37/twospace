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
        // Expect locations as array of objects { id, name }
        if (json.data && Array.isArray(json.data)) {
          // Use 'unknown' instead of 'any' and add a type guard for ESLint compliance
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
        value={filters.location}
        onValueChange={(value) => onFilterChange("location", value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={loc.id}>
              {loc.name}
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
