// frontend/app/assets/page.tsx
// Assets Management Page
"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AssetTable } from "@/components/assets/asset-table";
import {
  AssetFilters,
  FilterState,
  FilterKey,
} from "@/components/assets/asset-filters";
import { AssetActions } from "@/components/assets/asset-actions";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { AssetType, AssetState } from "@/lib/types";

export default function AssetsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: FilterState = {
    type: (searchParams.get("type") as AssetType) || "all",
    state: (searchParams.get("state") as AssetState) || "all",
  };

  const handleFilterChange = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");

    const newQueryString = params.toString();
    router.replace(`${pathname}?${newQueryString}`);
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
          <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s assets and track their lifecycle
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/assets/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <AssetFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Assets Table */}
      <div className="rounded-md border">
        <Suspense fallback={<AssetsLoadingSkeleton />}>
          <AssetTable
            queryString={searchParams.toString()}
            onPageChange={handlePageChange}
          />
        </Suspense>
      </div>

      {/* Bulk Actions */}
      <AssetActions />
    </div>
  );
}

// A more detailed loading skeleton
function AssetsLoadingSkeleton() {
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

// Loading component for the page
export function AssetsLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex space-x-2">
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="h-12 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded" />
    </div>
  );
}
