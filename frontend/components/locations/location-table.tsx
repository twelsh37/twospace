"use client";
// frontend/components/locations/location-table.tsx
// Table for displaying locations in the same style as the users table

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

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { LocationDetailModal } from "./location-detail-modal";
import { LocationEditModal } from "./location-edit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LocationAssignmentsModal } from "./location-assignments-modal";
import { useAuth } from "@/lib/auth-context";

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
  onRefresh?: () => void; // Optional callback to trigger parent refresh
};

interface Pagination {
  page: number;
  limit: number;
  totalLocations: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function LocationTable({
  filters,
  page,
  onPageChange,
  onRefresh,
}: Props) {
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
  // State for assignments modal
  const [assignmentsModalOpen, setAssignmentsModalOpen] = useState(false);
  const [assignmentsLocationId, setAssignmentsLocationId] = useState<
    string | null
  >(null);

  // Get authenticated user's role
  const { userRole } = useAuth();
  const currentUserRole = userRole || "USER";
  const isUser = currentUserRole === "USER";

  // Memoize fetchLocations to avoid useEffect dependency warning
  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location && filters.location !== "all") {
        params.set("locationId", filters.location);
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
  }, [filters, page]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

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
      // Refresh the data after deletion
      await fetchLocations();
      // Also trigger parent refresh if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      setDeleting(false);
    }
    setDeleting(false);
  };

  // Handle location update - refresh data without clearing first
  const handleLocationUpdated = async () => {
    setEditModalOpen(false);
    setEditLocationId(null);
    // Refresh the data after update
    await fetchLocations();
    // Also trigger parent refresh if callback provided
    if (onRefresh) {
      onRefresh();
    }
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
    <ErrorBoundary>
      <div className="w-full">
        <LocationAssignmentsModal
          locationId={assignmentsLocationId}
          open={assignmentsModalOpen}
          onOpenChange={setAssignmentsModalOpen}
        />
        <LocationDetailModal
          locationId={selectedLocationId}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
        <LocationEditModal
          locationId={editLocationId}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUpdated={handleLocationUpdated}
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
        {/* Touch-friendly card layout for mobile */}
        <div className="block md:hidden space-y-4">
          {locations.map((loc) => (
            <Card
              key={loc.id}
              className="rounded-xl shadow-md p-4 flex flex-col gap-2"
            >
              <CardHeader className="flex flex-row items-center justify-between px-0 pb-2">
                <CardTitle className="text-lg font-bold">{loc.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLocationClick(loc.id)}
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <span
                    title={
                      isUser
                        ? "You do not have permission to edit locations."
                        : "Edit location"
                    }
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(loc.id)}
                      title="Edit location"
                      disabled={isUser}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  </span>
                  <span
                    title={
                      isUser
                        ? "You do not have permission to delete locations."
                        : "Delete location"
                    }
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(loc.id)}
                      title="Delete location"
                      disabled={isUser}
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </Button>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <div className="text-sm text-muted-foreground mb-1">
                  {loc.description || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      loc.isActive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {loc.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Table layout for desktop/tablet */}
        <div className="hidden md:block">
          {/* Table is now left-aligned with filters, not centered */}
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              fontSize: "12px",
              tableLayout: "fixed", // Ensures columns respect width
              minWidth: "600px", // Prevents table from being too wide
              maxWidth: "900px", // Restricts max width for compactness
              marginLeft: 0, // Left align
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1d4ed8",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {/* Name column first */}
                <th
                  style={{
                    padding: "0.5rem 8px 0.5rem 0.5rem",
                    border: "none",
                    borderTopLeftRadius: "12px",
                    textAlign: "left",
                    width: "28%",
                  }}
                >
                  Name
                </th>
                {/* Description column next */}
                <th
                  style={{
                    padding: "0.5rem",
                    border: "none",
                    textAlign: "left",
                    width: "32%",
                  }}
                >
                  Description
                </th>
                {/* Status column */}
                <th
                  style={{
                    padding: "0.5rem",
                    border: "none",
                    textAlign: "left",
                    width: "14%",
                  }}
                >
                  Status
                </th>
                {/* Actions column rightmost, right-aligned */}
                <th
                  style={{
                    padding: "0.5rem",
                    border: "none",
                    borderTopRightRadius: "12px",
                    textAlign: "right",
                    width: "18%",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, idx) => (
                <tr
                  key={loc.id}
                  style={{
                    transition: "background 0.2s",
                    borderBottom:
                      idx === locations.length - 1
                        ? "none"
                        : "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#f3f4f6")
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = "")}
                >
                  {/* Name cell */}
                  <td
                    style={{
                      padding: "0.5rem 8px 0.5rem 0.5rem",
                      border: "none",
                      textAlign: "left",
                      fontWeight: 500,
                      width: "28%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <button
                      onClick={() => {
                        setAssignmentsLocationId(loc.id);
                        setAssignmentsModalOpen(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        cursor: "pointer",
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      {loc.name}
                    </button>
                  </td>
                  {/* Description cell */}
                  <td
                    style={{
                      padding: "0.5rem 0.25rem",
                      border: "none",
                      textAlign: "left",
                      width: "32%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {loc.description || "—"}
                  </td>
                  {/* Status cell */}
                  <td
                    style={{
                      padding: "0.5rem 0.25rem",
                      border: "none",
                      textAlign: "left",
                      width: "14%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loc.isActive ? (
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>
                        Active
                      </span>
                    ) : (
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>
                        Inactive
                      </span>
                    )}
                  </td>
                  {/* Actions cell, right-aligned, rightmost */}
                  <td
                    style={{
                      padding: "0.5rem 0.25rem 0.5rem 0.25rem",
                      border: "none",
                      textAlign: "right",
                      width: "18%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "flex-end", // Right-align actions
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLocationClick(loc.id)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <span
                        title={
                          isUser
                            ? "You do not have permission to edit locations."
                            : "Edit location"
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(loc.id)}
                          title="Edit location"
                          disabled={isUser}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </span>
                      <span
                        title={
                          isUser
                            ? "You do not have permission to delete locations."
                            : "Delete location"
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(loc.id)}
                          title="Delete location"
                          disabled={isUser}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls moved below the table, right-aligned with table */}
          {pagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 mt-3 gap-4">
              {/* Left-aligned: Showing X of Y locations */}
              <div className="text-sm text-muted-foreground text-left">
                Showing {locations.length} of {pagination.totalLocations}{" "}
                locations
              </div>
              {/* Right-aligned: Pagination controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-4 py-2 md:size-sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-4 py-2 md:size-sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  aria-label="Next page"
                  title="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
