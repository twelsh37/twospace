// frontend/app/locations/page.tsx
// Locations Management Page
"use client";

import { Suspense, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import {
  LocationFilters,
  LocationFilterState,
} from "@/components/locations/location-filters";
import { LocationTable } from "@/components/locations/location-table";
import { LocationAddModal } from "@/components/locations/location-add-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExportModal } from "@/components/ui/export-modal";

export default function LocationsPage() {
  // Filter and pagination state
  const [filters, setFilters] = useState<LocationFilterState>({
    location: "all",
    isActive: "all",
  });
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  // Add a refresh trigger to force re-render of the table
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleFilterChange = (
    key: keyof LocationFilterState,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ location: "all", isActive: "all" });
    setPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  // Function to trigger a refresh of the table data
  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Export handler for PDF or CSV
  const handleExport = async (format: "pdf" | "csv") => {
    setExportLoading(true);
    try {
      // Send selected format and filters to API
      const res = await fetch("/api/locations/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: filters.location,
          isActive: filters.isActive,
          format,
        }),
      });
      if (!res.ok) throw new Error(`Failed to export ${format.toUpperCase()}`);
      const blob = await res.blob();
      // Set filename and extension based on format
      const filename =
        format === "csv" ? "locations-report.csv" : "locations-report.pdf";
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
        `Failed to export locations ${format.toUpperCase()}. Please try again.`
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
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                style={{ fontSize: "2rem", textAlign: "left", marginBottom: 0 }}
              >
                Locations
              </CardTitle>
              <p className="text-muted-foreground" style={{ marginTop: 4 }}>
                Manage your organization&apos;s locations and their details
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
                Add Location
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <LocationAddModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            onAdded={() => {
              setAddModalOpen(false);
              handleRefresh();
              if (
                typeof window !== "undefined" &&
                (window as unknown as { mutateDashboard?: () => void })
                  .mutateDashboard
              ) {
                (window as unknown as { mutateDashboard?: () => void })
                  .mutateDashboard!();
              }
            }}
          />
          <LocationFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          {/* Match /assets: mt-4 below filters */}
          <div className="mt-4">
            <Suspense fallback={<LocationsLoadingSkeleton />}>
              <LocationTable
                key={`${refreshTrigger}-${page}-${filters.location}-${filters.isActive}`}
                filters={filters}
                page={page}
                onPageChange={handlePageChange}
                onRefresh={handleRefresh}
              />
            </Suspense>
          </div>
          <ExportModal
            open={exportModalOpen}
            onOpenChange={setExportModalOpen}
            onExport={handleExport}
            loading={exportLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LocationsLoadingSkeleton() {
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
