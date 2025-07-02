// frontend/app/users/page.tsx
// Users Management Page
"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserTable } from "@/components/users/user-table";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { UserFilters, UserFilterState } from "@/components/users/user-filters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserAddModal } from "@/components/users/user-add-modal";

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

  // Filters and pagination state
  const filters: UserFilterState = {
    department: searchParams?.get("department") || "all",
    role: searchParams?.get("role") || "all",
  };
  const page = parseInt(searchParams?.get("page") || "1", 10);

  const handleFilterChange = (key: keyof UserFilterState, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
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

  return (
    <div className="flex-1 flex justify-center items-start p-2 md:p-4">
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
      >
        <CardHeader
          style={{
            padding: "1rem 1.5rem 0.5rem 1.5rem",
            width: "100%",
            marginBottom: 0,
          }}
        >
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
              <Button variant="outline" size="sm">
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
        <CardContent style={{ padding: "1rem 1.5rem 1.5rem 1.5rem" }}>
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          <div style={{ marginTop: 12 }}>
            <Suspense fallback={<UsersLoadingSkeleton />}>
              <UserTable
                filters={filters}
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
