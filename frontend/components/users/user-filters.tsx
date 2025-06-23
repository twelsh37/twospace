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

export interface UserFilterState {
  department: string;
  role: string;
}

export interface UserFiltersProps {
  filters: UserFilterState;
  onFilterChange: (key: keyof UserFilterState, value: string) => void;
  onClearFilters: () => void;
}

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

export function UserFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: UserFiltersProps) {
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    // Fetch unique departments from the API
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        if (json.departments && Array.isArray(json.departments)) {
          setDepartments(["all", ...json.departments]);
        } else {
          setDepartments(["all"]);
        }
      } catch {
        setDepartments(["all"]);
      }
    }
    fetchDepartments();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      {/* Department Filter */}
      <Select
        value={filters.department}
        onValueChange={(value) => onFilterChange("department", value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments
            .filter((d) => d !== "all")
            .map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select
        value={filters.role}
        onValueChange={(value) => onFilterChange("role", value)}
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
