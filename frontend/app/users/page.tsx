// frontend/app/users/page.tsx
// Users Management Page
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserTable } from "@/components/users/user-table";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import {
  UserFilters,
  UserFilterState,
  DepartmentOption,
  RoleOption,
} from "@/components/users/user-filters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserAddModal } from "@/components/users/user-add-modal";
import { ExportModal } from "@/components/ui/export-modal";

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <UsersPageContent />
    </Suspense>
  );
}

function UsersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Departments and roles state
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const ROLE_OPTIONS = [
    { value: "all", label: "All Roles" },
    { value: "ADMIN", label: "Admin" },
    { value: "USER", label: "User" },
  ];

  // Fetch departments on mount
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        if (json.departments && Array.isArray(json.departments)) {
          setDepartments(json.departments);
        } else {
          setDepartments([]);
        }
      } catch {
        setDepartments([]);
      }
    }
    fetchDepartments();
  }, []);

  // Parse filter values from URL and map to objects
  const departmentParam = searchParams?.get("department") || "all";
  const roleParam = searchParams?.get("role") || "all";
  const selectedDepartment =
    departmentParam === "all"
      ? null
      : departments.find((d) => d.id === departmentParam) || null;
  const selectedRole =
    roleParam === "all"
      ? null
      : ROLE_OPTIONS.find((r) => r.value === roleParam) || null;

  // filters object now only uses DepartmentOption | null and RoleOption | null
  const filters: UserFilterState = {
    department: selectedDepartment,
    role: selectedRole,
  };
  const page = parseInt(searchParams?.get("page") || "1", 10);

  const handleFilterChange = (
    key: keyof UserFilterState,
    value: DepartmentOption | RoleOption | null
  ) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    // Debug log to see what is being passed as value
    console.log("handleFilterChange", key, value);
    if (
      !value ||
      (key === "role" && (value as RoleOption).value === "all") ||
      (key === "department" && (value as DepartmentOption).id === "all")
    ) {
      params.delete(key);
    } else {
      if (key === "department") {
        // Type guard: ensure value is DepartmentOption
        if (
          typeof value === "object" &&
          value !== null &&
          "id" in value &&
          typeof (value as DepartmentOption).id === "string"
        ) {
          params.set("department", (value as DepartmentOption).id);
        } else {
          console.warn(
            "Department value is not an object with string id:",
            value
          );
        }
      } else if (key === "role") {
        // Type guard: ensure value is RoleOption
        if (
          typeof value === "object" &&
          value !== null &&
          "value" in value &&
          typeof (value as RoleOption).value === "string"
        ) {
          params.set("role", (value as RoleOption).value);
        } else {
          console.warn("Role value is not an object with string value:", value);
        }
      }
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname ?? "/");
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("page", pageNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleExport = async (format: "pdf" | "csv") => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/users/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: filters.department?.id || "all",
          role: filters.role?.value || "all",
          format,
        }),
      });
      if (!res.ok) throw new Error(`Failed to export ${format.toUpperCase()}`);
      const blob = await res.blob();
      const filename =
        format === "csv" ? "users-report.csv" : "users-report.pdf";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(
        `Failed to export users ${format.toUpperCase()}. Please try again.`
      );
    } finally {
      setExportLoading(false);
      setExportModalOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8">
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                style={{
                  fontSize: "2rem",
                  textAlign: "left",
                  marginBottom: 0,
                  lineHeight: 1.1,
                }}
              >
                Users
              </CardTitle>
              <p
                className="text-muted-foreground"
                style={{ marginTop: 2, marginBottom: 0 }}
              >
                Manage your organization&apos;s users and their roles
              </p>
            </div>
            <div className="flex items-center space-x-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportModalOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => setAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          {/* Match /assets: mt-4 below filters */}
          <div className="mt-4">
            <Suspense fallback={<UsersLoadingSkeleton />}>
              <UserTable
                filters={{
                  department: filters.department
                    ? filters.department.id
                    : "all",
                  role: filters.role ? filters.role.value : "all",
                }}
                page={page}
                onPageChange={handlePageChange}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card>
      <UserAddModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          // Refresh the user list by navigating to the current page
          const params = new URLSearchParams(searchParams?.toString() ?? "");
          router.replace(`${pathname}?${params.toString()}`);
        }}
      />
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
        loading={exportLoading}
      />
    </div>
  );
}

function UsersLoadingSkeleton() {
  return (
    <div className="p-8">
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  );
}
