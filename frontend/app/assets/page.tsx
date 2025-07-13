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
import { AssetType, AssetState } from "@/lib/types";
import { ExportModal } from "@/components/ui/export-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import HoldingAssetsTable from "@/components/holding-assets/HoldingAssetsTable";
import { AssetAddModal } from "@/components/assets/asset-add-modal";
import { useUnauthorizedToast } from "@/components/ui/unauthorized-toast";
import { createClientComponentClient } from "@/lib/supabase";

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
    type: "ALL", // Use uppercase 'ALL' for consistency
    state: "ALL",
    status: "ALL",
  }));

  // Keep filters in sync with URL query params
  useEffect(() => {
    setFilters({
      type: (searchParams?.get("type")?.toUpperCase() as AssetType) || "ALL",
      state: (searchParams?.get("state")?.toUpperCase() as AssetState) || "ALL",
      status: searchParams?.get("status")?.toUpperCase() || "ALL",
    });
  }, [searchParams]);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // State for controlling the Add Asset modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  // State to trigger asset table refresh after adding
  const [refreshKey, setRefreshKey] = useState(0);

  const [showUnauthorizedToast, unauthorizedToast] = useUnauthorizedToast();

  // Update both state and URL when a filter changes
  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value.toUpperCase() })); // Always store as uppercase
    // Use optional chaining and nullish coalescing to avoid errors if searchParams is null
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value.toUpperCase() === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value.toUpperCase());
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({ type: "ALL", state: "ALL", status: "ALL" }); // Reset to uppercase 'ALL'
    // Ensure pathname is a string; fallback to root if null
    router.push(pathname ?? "/assets");
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

  // Handler for Add Asset button
  const handleAddAssetClick = async () => {
    const supabase = createClientComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const role = session?.user?.user_metadata?.role;
    if (role !== "ADMIN") {
      showUnauthorizedToast();
      return;
    }
    setAddModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8">
      {unauthorizedToast}
      {/* Assets Table */}
      <Card className="shadow-lg border rounded-xl">
        <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <CardTitle
              style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
            >
              Assets
            </CardTitle>
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
            {filters.status !== "HOLDING" && (
              // Replaced Link with modal trigger button
              <Button
                size="sm"
                className="w-full md:w-auto"
                onClick={handleAddAssetClick}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Asset</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
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
              {filters.status === "HOLDING" ? (
                <div>
                  <div className="mb-2 text-blue-700 font-semibold text-center">
                    Showing assets in{" "}
                    <span className="underline">pending (holding)</span> status,
                    awaiting asseting.
                  </div>
                  <HoldingAssetsTable />
                </div>
              ) : (
                // Pass refreshKey as a prop to force AssetTable to reload after add
                <AssetTable
                  key={refreshKey}
                  queryString={(() => {
                    const params = new URLSearchParams(
                      searchParams?.toString() ?? ""
                    );
                    if (filters.status === "ALL") {
                      params.delete("status");
                    } else if (filters.status) {
                      params.set("status", filters.status);
                    }
                    if (filters.type === "ALL") {
                      params.delete("type");
                    } else if (filters.type) {
                      params.set("type", filters.type);
                    }
                    if (filters.state === "ALL") {
                      params.delete("state");
                    } else if (filters.state) {
                      params.set("state", filters.state);
                    }
                    return params.toString();
                  })()}
                  onPageChange={handlePageChange}
                />
              )}
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

      {/* Add Asset Modal */}
      <AssetAddModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          // Refresh asset table after successful add
          setRefreshKey((k) => k + 1);
        }}
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
