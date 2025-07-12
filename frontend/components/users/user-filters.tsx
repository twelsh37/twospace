// frontend/components/users/user-filters.tsx
// UserFilters component for filtering users by department and role

import { useEffect, useState } from "react";
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
    value: DepartmentOption | RoleOption | null
  ) => void;
  onClearFilters: () => void;
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
}: UserFiltersProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    // Fetch unique departments from the API
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        // Expect departments as array of objects { id, name }
        if (json.departments && Array.isArray(json.departments)) {
          // Use 'unknown' instead of 'any' and add a type guard for ESLint compliance
          const validDepartments = json.departments.filter(
            (d: unknown) =>
              d &&
              typeof d === "object" &&
              typeof (d as { id?: unknown }).id === "string" &&
              typeof (d as { name?: unknown }).name === "string"
          );
          setDepartments(validDepartments);
        } else {
          setDepartments([]);
        }
      } catch {
        setDepartments([]);
      }
    }
    fetchDepartments();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      {/* Department Filter */}
      <Select
        value={filters.department || "ALL"}
        onValueChange={(value) => {
          if (value === "ALL") {
            onFilterChange("department", "ALL");
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
            onFilterChange("role", "ALL");
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
