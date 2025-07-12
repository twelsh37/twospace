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
  department: DepartmentOption | null;
  role: RoleOption | null;
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
  { value: "all", label: "All Roles" },
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
        value={filters.department?.id || "all"}
        onValueChange={(value) => {
          // Debug log to see what value is selected for department
          console.log("UserFilters department onValueChange", value);
          // Type guard: ensure value is a string (id)
          if (value === "all") {
            onFilterChange("department", null);
          } else if (typeof value === "string") {
            const selected = departments.find((d) => d.id === value) || null;
            onFilterChange("department", selected);
          } else {
            console.warn("Department value is not a string:", value);
            onFilterChange("department", null);
          }
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select
        value={filters.role?.value || "all"}
        onValueChange={(value) => {
          // Debug log to see what value is selected for role
          console.log("UserFilters role onValueChange", value);
          // Type guard: ensure value is a string (role value)
          if (value === "all") {
            onFilterChange("role", null);
          } else if (typeof value === "string") {
            const selected =
              ROLE_OPTIONS.find((r) => r.value === value) || null;
            onFilterChange("role", selected);
          } else {
            console.warn("Role value is not a string:", value);
            onFilterChange("role", null);
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
