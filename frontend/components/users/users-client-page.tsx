// frontend/components/users/users-client-page.tsx

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

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserTable } from "./user-table";
import { UserFilters, UserFilterState, DepartmentOption } from "./user-filters";
import { Button } from "@/components/ui/button";
import { UserAddModal } from "./user-add-modal";
import { Download, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useUnauthorizedToast } from "@/components/ui/unauthorized-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  isActive: boolean;
  employeeId: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersClientPageProps {
  users: User[];
  departments: DepartmentOption[];
  filters: UserFilterState;
  pagination: Pagination;
}

export default function UsersClientPage({
  users,
  departments,
  filters: initialFilters,
  pagination: initialPagination,
}: UsersClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { userRole } = useAuth();
  const [showUnauthorized, unauthorizedToast] = useUnauthorizedToast();

  // Handle filter changes by updating the URL (triggers SSR)
  const handleFilterChange = (
    key: keyof UserFilterState,
    value: DepartmentOption | { value: string; label: string } | string | null
  ) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    let newValue = value;
    if (typeof value === "object" && value !== null) {
      if ("id" in value) newValue = value.id;
      else if ("value" in value) newValue = value.value;
    }
    if (!newValue || newValue === "ALL") {
      params.delete(key);
    } else {
      params.set(key, String(newValue));
    }
    params.set("page", "1"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`);
    setFilters((prev) => ({ ...prev, [key]: String(newValue) }));
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("department");
    params.delete("role");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setFilters({ department: "ALL", role: "ALL" });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex-1 flex flex-col pt-6 pb-2 md:pb-4 px-4 md:px-8">
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
          {/* Add py-8 (32px) vertical padding between the top of the page and the Users title */}
          <div className="py-8 flex items-center justify-between">
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
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-900"
                onClick={() => {
                  if (userRole !== "ADMIN") {
                    showUnauthorized();
                    return;
                  }
                  setAddModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
              <UserAddModal
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            departments={departments}
          />
          <div className="mt-4">
            <UserTable
              users={users}
              pagination={initialPagination}
              onPageChange={handlePageChange}
              // Pass the current user's role to UserTable for permission logic
              currentUserRole={userRole || "USER"}
            />
            {/* Add pagination controls here if needed, or inside UserTable */}
          </div>
        </CardContent>
      </Card>
      {unauthorizedToast}
    </div>
  );
}
