// frontend/components/locations/location-filters.tsx

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
import { useAuth } from "@/lib/auth-context";

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
  const { session } = useAuth();

  useEffect(() => {
    // Fetch unique locations from the API
    async function fetchLocations() {
      try {
        // Add authorization header if session exists
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/locations", { headers });
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
  }, [session]);

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
