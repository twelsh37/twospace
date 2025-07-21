// frontend/components/users/user-filters.tsx

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

// UserFilters component for filtering users by department and role

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Define types for department and role options
export interface DepartmentOption {
  id: string;
  name: string;
}
export interface RoleOption {
  value: string;
  label: string;
}

export interface UserFilterState {
  department: string; // Use 'ALL' for all departments
  role: string; // Use 'ALL' for all roles
}

export interface UserFiltersProps {
  filters: UserFilterState;
  onFilterChange: (
    key: keyof UserFilterState,
    value: DepartmentOption | RoleOption | string | null
  ) => void;
  onClearFilters: () => void;
  departments: DepartmentOption[];
}

const ROLE_OPTIONS: RoleOption[] = [
  { value: "ALL", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

export function UserFilters({
  filters,
  onFilterChange,
  onClearFilters,
  departments,
}: UserFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      {/* Department Filter */}
      <Select
        value={filters.department || "ALL"}
        onValueChange={(value) => {
          if (value === "ALL") {
            onFilterChange("department", value);
          } else if (typeof value === "string") {
            onFilterChange("department", value);
          } else {
            onFilterChange("department", "ALL");
          }
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select
        value={filters.role || "ALL"}
        onValueChange={(value) => {
          if (value === "ALL") {
            onFilterChange("role", value);
          } else if (typeof value === "string") {
            onFilterChange("role", value);
          } else {
            onFilterChange("role", "ALL");
          }
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      <Button variant="outline" size="sm" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
