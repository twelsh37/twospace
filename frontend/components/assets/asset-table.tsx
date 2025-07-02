// frontend/components/assets/asset-table.tsx
// Asset Table Component with client-side data fetching for robustness.
//
// DEBUGGING NOTE:
// - We log the fetched assets to the console after every fetch to help debug deleted asset issues.
// - After deleting an asset, we immediately refetch the asset list to ensure the UI is always up to date.
//
// Reasoning: This helps catch stale state or cache issues and ensures deleted assets disappear from the list right away.

"use client";

import { useState, useEffect } from "react";
import { Asset, AssetState, AssetType, AssetWithPagination } from "@/lib/types";
import { ASSET_STATE_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { AssetEditModal } from "./asset-edit-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { UserAssetsModal } from "@/components/users/user-assets-modal";

// Utility function to map asset state to solid background color classes
const getStateColorClass = (state: AssetState) => {
  // This function returns Tailwind classes for solid backgrounds and white text
  // AVAILABLE - Blue, SIGNED_OUT - Teal, BUILDING - Orange, READY_TO_GO - Purple, ISSUED - Green
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white";
    case AssetState.BUILDING:
      return "bg-orange-500 text-white";
    case AssetState.READY_TO_GO:
      return "bg-purple-600 text-white";
    case AssetState.ISSUED:
      return "bg-green-600 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

interface AssetTableProps {
  queryString: string;
  onPageChange: (pageNumber: number) => void;
}

export function AssetTable({ queryString, onPageChange }: AssetTableProps) {
  const [data, setData] = useState<AssetWithPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAssetNumber, setEditAssetNumber] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAssetNumber, setDeleteAssetNumber] = useState<string | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // User assets modal state
  const [userAssetsModalOpen, setUserAssetsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  // Placeholder for userId until real auth is implemented
  const currentUserId = "admin-user-id"; // TODO: Replace with real user ID from auth context

  // Fetch assets function is now reusable for refetching after delete
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assets?${queryString}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }
      const result = await response.json();
      // DEBUG: Log the assets array to help debug deleted asset issues
      console.log("[AssetTable] Assets fetched:", result.data?.assets);
      setData(result.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const handleEditClick = (assetNumber: string) => {
    setEditAssetNumber(assetNumber);
    setEditModalOpen(true);
  };

  const handleAssetUpdated = () => {
    setEditModalOpen(false);
    setData(null);
    setTimeout(() => {
      onPageChange(data?.pagination.page || 1);
      if (
        typeof window !== "undefined" &&
        (window as Window & { mutateDashboard?: () => void }).mutateDashboard
      ) {
        (window as Window & { mutateDashboard?: () => void })
          .mutateDashboard!();
      }
    }, 100);
  };

  const handleDeleteClick = (assetNumber: string) => {
    setDeleteAssetNumber(assetNumber);
    setDeleteModalOpen(true);
  };

  // After a successful delete, refetch the asset list instead of setTimeout/setData(null)
  const handleDeleteConfirmed = async (reason: string, comment: string) => {
    if (!deleteAssetNumber) return;
    setDeleting(true);
    try {
      await fetch(`/api/assets/${deleteAssetNumber}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveReason: reason,
          comment: comment,
          userId: currentUserId,
        }),
      });
      setDeleteModalOpen(false);
      setDeleteAssetNumber(null);
      // Immediately refetch assets to ensure UI is up to date
      // DEBUG: This ensures deleted assets disappear right away
      await fetchAssets();
      if (
        typeof window !== "undefined" &&
        (window as Window & { mutateDashboard?: () => void }).mutateDashboard
      ) {
        (window as Window & { mutateDashboard?: () => void })
          .mutateDashboard!();
      }
    } catch {
      setDeleting(false);
    }
    setDeleting(false);
  };

  // Handle clicking on assigned to field to show user assets modal
  const handleAssignedToClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setUserAssetsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading assets...</div>;
  }

  if (!data || !data.assets || data.assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No assets found.</p>
      </div>
    );
  }

  const { assets, pagination } = data;
  const { page, totalPages, totalAssets } = pagination;

  return (
    <div className="w-full">
      <AssetEditModal
        assetNumber={editAssetNumber}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={handleAssetUpdated}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirmed}
        loading={deleting}
        title="Delete Asset"
        description={
          "This action cannot be undone. Please select a reason for deletion."
        }
      />
      <UserAssetsModal
        employeeId={selectedEmployeeId}
        open={userAssetsModalOpen}
        onOpenChange={setUserAssetsModalOpen}
      />
      <div>
        {/* Modern table style: rounded corners, colored header, bold/white header text, row hover, compact padding, pronounced border, and box shadow. */}
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            fontSize: "12px",
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
              <th
                style={{
                  padding: "0.5rem",
                  border: "none",
                  borderTopLeftRadius: "12px",
                }}
              >
                Asset Number
              </th>
              <th style={{ padding: "0.5rem", border: "none" }}>Type</th>
              <th style={{ padding: "0.5rem", border: "none" }}>Description</th>
              <th style={{ padding: "0.5rem", border: "none" }}>State</th>
              <th style={{ padding: "0.5rem", border: "none" }}>Location</th>
              <th style={{ padding: "0.5rem", border: "none" }}>Assigned To</th>
              <th style={{ padding: "0.5rem", border: "none" }}>
                Purchase Price
              </th>
              <th style={{ padding: "0.5rem", border: "none" }}>Updated</th>
              <th
                style={{
                  padding: "0.5rem",
                  border: "none",
                  borderTopRightRadius: "12px",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset: Asset, idx: number) => (
              <tr
                key={asset.assetNumber || asset.serialNumber || `row-${idx}`}
                style={{
                  background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                  transition: "background 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#e0e7ff")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    idx % 2 === 0 ? "#f8fafc" : "#fff")
                }
              >
                <td style={{ padding: "0.5rem", fontWeight: 500 }}>
                  <Link
                    href={`/assets/${asset.assetNumber}`}
                    className="hover:underline"
                  >
                    {asset.assetNumber}
                  </Link>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {ASSET_TYPE_LABELS[asset.type as AssetType]}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    maxWidth: "200px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {asset.description}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <Badge
                    className={getStateColorClass(asset.state as AssetState)}
                  >
                    {ASSET_STATE_LABELS[asset.state as AssetState]}
                  </Badge>
                </td>
                <td style={{ padding: "0.5rem" }}>{asset.location}</td>
                <td style={{ padding: "0.5rem" }}>
                  {asset.assignedTo ? (
                    <div>
                      <div className="font-medium">{asset.assignedTo}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.employeeId ? (
                          <button
                            onClick={() =>
                              handleAssignedToClick(asset.employeeId!)
                            }
                            className="hover:underline hover:text-blue-600 cursor-pointer transition-colors"
                            title="Click to view user details and assigned assets"
                          >
                            {asset.employeeId}
                          </button>
                        ) : (
                          asset.employeeId
                        )}{" "}
                        • {asset.department}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {formatCurrency(parseFloat(asset.purchasePrice))}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {new Date(asset.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/assets/${asset.assetNumber}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditClick(asset.assetNumber)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(asset.assetNumber)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 mt-3">
        <div className="text-sm text-muted-foreground">
          Showing {assets.length} of {totalAssets} assets
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{
              background: page <= 1 ? "#aaa" : "#1d4ed8",
              color: "white",
              border: "1px solid #1d4ed8",
            }}
            aria-label="Previous page"
            title="Previous page"
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              background: page >= totalPages ? "#aaa" : "#1d4ed8",
              color: "white",
              border: "1px solid #1d4ed8",
            }}
            aria-label="Next page"
            title="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
