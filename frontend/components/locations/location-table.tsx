// frontend/components/locations/location-table.tsx
// Table for displaying locations in the same style as the users table

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { LocationDetailModal } from "./location-detail-modal";
import { LocationEditModal } from "./location-edit-modal";

export type Location = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  filters: {
    location: string;
    isActive: string; // "all" | "true" | "false"
  };
  page: number;
  onPageChange: (page: number) => void;
};

interface Pagination {
  page: number;
  limit: number;
  totalLocations: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function LocationTable({ filters, page, onPageChange }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchLocations() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.location && filters.location !== "all") {
          params.set("name", filters.location);
        }
        if (filters.isActive && filters.isActive !== "all") {
          params.set("isActive", filters.isActive);
        }
        params.set("page", page.toString());
        params.set("limit", "10");
        const response = await fetch(`/api/locations?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch locations");
        const result = await response.json();
        setLocations(result.data || []);
        setPagination(result.pagination || null);
      } catch {
        setLocations([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, [filters, page]);

  const handleLocationClick = (locationId: string) => {
    setSelectedLocationId(locationId);
    setDetailModalOpen(true);
  };

  const handleEditClick = (locationId: string) => {
    setEditLocationId(locationId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (locationId: string) => {
    setDeleteLocationId(locationId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteLocationId) return;
    setDeleting(true);
    try {
      await fetch(`/api/locations/${deleteLocationId}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setDeleteLocationId(null);
      setLocations([]);
      setTimeout(() => {
        onPageChange(page);
      }, 100);
    } catch {
      setDeleting(false);
    }
    setDeleting(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading locations...</div>;
  }

  if (!locations.length) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No locations found.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LocationDetailModal
        locationId={selectedLocationId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
      <LocationEditModal
        locationId={editLocationId}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={() => {
          setEditModalOpen(false);
          setLocations([]);
          onPageChange(page);
        }}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirmed}
        loading={deleting}
        title="Delete Location"
        description={
          "This action cannot be undone. To confirm, type 'confirm deletion' below to delete this location."
        }
      />
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">
                  <button
                    onClick={() => handleLocationClick(loc.id)}
                    className="font-medium"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                    }}
                  >
                    {loc.name}
                  </button>
                </TableCell>
                <TableCell>{loc.description || "-"}</TableCell>
                <TableCell>{loc.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLocationClick(loc.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(loc.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(loc.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination and count */}
      {pagination && (
        <div className="flex items-center justify-between p-4 mt-3">
          <div className="text-sm text-muted-foreground">
            Showing {locations.length} of {pagination.totalLocations} locations
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
