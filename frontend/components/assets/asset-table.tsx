// frontend/components/assets/asset-table.tsx
// Asset Table Component with client-side data fetching for robustness.

"use client";

import { useState, useEffect } from "react";
import { Asset, AssetState, AssetType, AssetWithPagination } from "@/lib/types";
import { ASSET_STATE_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { getApiBaseUrl } from "@/lib/config";
import { AssetEditModal } from "./asset-edit-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";

const getStateVariant = (state: AssetState) => {
  switch (state) {
    case AssetState.AVAILABLE:
      return "secondary";
    case AssetState.SIGNED_OUT:
      return "outline";
    case AssetState.BUILT:
      return "default";
    case AssetState.READY_TO_GO:
      return "default";
    case AssetState.ISSUED:
      return "destructive";
    default:
      return "secondary";
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

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/assets?${queryString}`,
          {
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch assets");
        }
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
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

  const handleDeleteConfirmed = async () => {
    if (!deleteAssetNumber) return;
    setDeleting(true);
    try {
      await fetch(`/api/assets/${deleteAssetNumber}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setDeleteAssetNumber(null);
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
    } catch {
      setDeleting(false);
    }
    setDeleting(false);
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
          "This action cannot be undone. To confirm, type 'confirm deletion' below to delete this asset."
        }
      />
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset: Asset) => (
              <TableRow key={asset.assetNumber}>
                <TableCell className="font-medium">
                  <Link
                    href={`/assets/${asset.assetNumber}`}
                    className="hover:underline"
                  >
                    {asset.assetNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {ASSET_TYPE_LABELS[asset.type as AssetType]}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {asset.description}
                </TableCell>
                <TableCell>
                  <Badge variant={getStateVariant(asset.state as AssetState)}>
                    {ASSET_STATE_LABELS[asset.state as AssetState]}
                  </Badge>
                </TableCell>
                <TableCell>{asset.location}</TableCell>
                <TableCell>
                  {asset.assignedTo ? (
                    <div>
                      <div className="font-medium">{asset.assignedTo}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.employeeId} • {asset.department}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrency(parseFloat(asset.purchasePrice))}
                </TableCell>
                <TableCell>
                  {new Date(asset.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
