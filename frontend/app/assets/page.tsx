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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  // Use optional chaining to avoid errors if searchParams is null
  const [filters, setFilters] = useState<FilterState>(() => ({
    type: (searchParams?.get("type") as AssetType) || "all",
    state: (searchParams?.get("state") as AssetState) || "all",
    status: searchParams?.get("status") || "all",
  }));

  // Keep filters in sync with URL query params
  useEffect(() => {
    setFilters({
      type: (searchParams?.get("type") as AssetType) || "all",
      state: (searchParams?.get("state") as AssetState) || "all",
      status: searchParams?.get("status") || "all",
    });
  }, [searchParams]);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Update both state and URL when a filter changes
  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Use optional chaining and nullish coalescing to avoid errors if searchParams is null
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
    setFilters({ type: "all", state: "all", status: "all" });
    // Ensure pathname is a string; fallback to root if null
    router.push(pathname ?? "/");
  };

  const handlePageChange = (pageNumber: number) => {
    // Use optional chaining and nullish coalescing to avoid errors if searchParams is null
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("page", pageNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Export handler for PDF or CSV
  const handleExport = async (format: "pdf" | "csv") => {
    setExportLoading(true);
    try {
      // Send selected format and filters to API
      const res = await fetch("/api/assets/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: filters.type,
          state: filters.state,
          status: filters.status,
          format,
        }),
      });
      if (!res.ok) throw new Error(`Failed to export ${format.toUpperCase()}`);
      const blob = await res.blob();
      // Set filename and extension based on format
      const filename =
        format === "csv" ? "assets-report.csv" : "assets-report.pdf";
      // Download the file
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
        `Failed to export assets ${format.toUpperCase()}. Please try again.`
      );
    } finally {
      setExportLoading(false);
      setExportModalOpen(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-3 md:p-6 pt-4 md:pt-8">
      {/* Assets Table */}
      <Card className="shadow-lg border rounded-xl">
        <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <CardTitle className="text-xl md:text-2xl">Assets</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your organization&apos;s assets and track their lifecycle
            </p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-2 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="flex-1 md:flex-none"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Link href="/assets/new" className="flex-1 md:flex-none">
              <Button size="sm" className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Asset</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filters */}
          <AssetFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          <div className="mt-4">
            <Suspense fallback={<AssetsLoadingSkeleton />}>
              <AssetTable
                queryString={(() => {
                  // Use optional chaining and nullish coalescing to avoid errors if searchParams is null
                  const params = new URLSearchParams(
                    searchParams?.toString() ?? ""
                  );
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
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <AssetActions />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
        loading={exportLoading}
      />
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
