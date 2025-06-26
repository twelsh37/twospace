// frontend/app/assets/page.tsx
// Assets Management Page
"use client";

import { Suspense, useState, useEffect } from "react";
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
import { ExportModal } from "@/components/ui/export-modal";
import { exportToCSV, exportToXLSX } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/config";

export default function AssetsPage() {
  return (
    <Suspense fallback={<AssetsLoadingSkeleton />}>
      <AssetsPageContent />
    </Suspense>
  );
}

function AssetsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Controlled filter state
  const [filters, setFilters] = useState<FilterState>(() => ({
    type: (searchParams.get("type") as AssetType) || "all",
    state: (searchParams.get("state") as AssetState) || "all",
    status: searchParams.get("status") || "all",
  }));

  // Keep filters in sync with URL query params
  useEffect(() => {
    setFilters({
      type: (searchParams.get("type") as AssetType) || "all",
      state: (searchParams.get("state") as AssetState) || "all",
      status: searchParams.get("status") || "all",
    });
  }, [searchParams]);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Update both state and URL when a filter changes
  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
    setFilters({ type: "all", state: "all", status: "all" });
    router.push(pathname);
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Export handler
  const handleExport = async (type: "csv" | "xlsx") => {
    setExportLoading(true);
    let dataToExport: Record<string, unknown>[] = [];
    // Always fetch all filtered data from backend
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/assets?${searchParams.toString()}&all=1`
      );
      const result = await response.json();
      dataToExport = result.data.assets;
    } catch {
      setExportLoading(false);
      alert("Failed to fetch all data for export.");
      return;
    }
    if (type === "csv") {
      exportToCSV(dataToExport, "assets.csv");
    } else {
      await exportToXLSX(dataToExport, "assets.xlsx");
    }
    setExportLoading(false);
    setExportModalOpen(false);
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
        {/* Button group: Increased gap to 20px (space-x-5) for better separation between Export and Add Asset buttons */}
        <div className="flex items-center space-x-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportModalOpen(true)}
          >
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

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
        loading={exportLoading}
      />

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
            queryString={(() => {
              const params = new URLSearchParams(searchParams.toString());
              // Remove status from query string if 'all' is selected
              if (filters.status === "all") {
                params.delete("status");
              } else if (filters.status) {
                params.set("status", filters.status);
              }
              if (filters.type === "all") {
                params.delete("type");
              } else if (filters.type) {
                params.set("type", filters.type);
              }
              if (filters.state === "all") {
                params.delete("state");
              } else if (filters.state) {
                params.set("state", filters.state);
              }
              return params.toString();
            })()}
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
