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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s locations and their details
          </p>
        </div>
        <div className="flex items-center space-x-5">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>
      </div>
      <LocationAddModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          setAddModalOpen(false);
          // Trigger a refresh after adding a new location
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
      {/* Filters */}
      <LocationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      {/* Locations Table */}
      <div className="rounded-md border">
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
