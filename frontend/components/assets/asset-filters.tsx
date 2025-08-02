// frontend/components/assets/asset-filters.tsx

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
import { useAuth } from "@/lib/auth-context";

export type FilterKey = "type" | "state" | "status";

export interface FilterState {
  type: AssetType | "ALL";
  state: AssetState | "ALL";
  status: string | "ALL";
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
  const { userRole } = useAuth();
  const isAdmin = userRole === "ADMIN";

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
              {isAdmin && <SelectItem value="HOLDING">Holding</SelectItem>}
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
