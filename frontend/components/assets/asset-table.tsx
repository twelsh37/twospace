// frontend/components/assets/asset-table.tsx
// Asset Table Component with sorting and filtering

"use client";

import { useState, useEffect } from "react";
import { Asset, AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
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

export function AssetTable() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalAssets: 0,
    totalPages: 1,
  });

  const fetchAssets = async (page = 1, limit = 25) => {
    const response = await fetch(`/api/assets?page=${page}&limit=${limit}`);
    const { data } = await response.json();
    if (data && data.assets) {
      setAssets(data.assets);
      setPagination(data.pagination);
    }
  };

  useEffect(() => {
    fetchAssets(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

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

  return (
    <div className="w-full">
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
          {assets.map((asset) => (
            <TableRow key={asset.assetNumber}>
              <TableCell className="font-medium">
                <Link
                  href={`/assets/${asset.assetNumber}`}
                  className="hover:underline"
                >
                  {asset.assetNumber}
                </Link>
              </TableCell>
              <TableCell>{ASSET_TYPE_LABELS[asset.type]}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {asset.description}
              </TableCell>
              <TableCell>
                <Badge variant={getStateVariant(asset.state)}>
                  {ASSET_STATE_LABELS[asset.state]}
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
              <TableCell>{formatCurrency(asset.purchasePrice)}</TableCell>
              <TableCell>{formatDate(new Date(asset.updatedAt))}</TableCell>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/assets/${asset.assetNumber}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Asset
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {assets.length} of {pagination.totalAssets} assets
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
