// frontend/app/users/page.tsx
// Users Management Page
"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserTable } from "@/components/users/user-table";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { UserFilters, UserFilterState } from "@/components/users/user-filters";

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

  // Filters and pagination state
  const filters: UserFilterState = {
    department: searchParams.get("department") || "all",
    role: searchParams.get("role") || "all",
  };
  const page = parseInt(searchParams.get("page") || "1", 10);

  const handleFilterChange = (key: keyof UserFilterState, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s users and their roles
          </p>
        </div>
        <div className="flex items-center space-x-5">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/users/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>
      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      {/* Users Table */}
      <div className="rounded-md border">
        <Suspense fallback={<UsersLoadingSkeleton />}>
          <UserTable
            filters={filters}
            page={page}
            onPageChange={handlePageChange}
          />
        </Suspense>
      </div>
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
