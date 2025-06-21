// frontend/components/assets/asset-table.tsx
// Asset Table Component with sorting and filtering

"use client";

import { useState } from "react";
import { Asset, AssetState, AssetType } from "@/lib/types";
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
  // TODO: Replace with real data from API
  const [assets] = useState<Asset[]>([
    {
      id: "1",
      assetNumber: "01-00001",
      type: AssetType.MOBILE_PHONE,
      state: AssetState.AVAILABLE,
      serialNumber: "MP001234567",
      description: "iPhone 15 Pro 256GB",
      purchasePrice: 1099.99,
      location: "IT Department",
      assignmentType: "INDIVIDUAL",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      assetNumber: "04-00001",
      type: AssetType.LAPTOP,
      state: AssetState.ISSUED,
      serialNumber: "LT987654321",
      description: 'MacBook Pro 16" M3',
      purchasePrice: 2499.99,
      location: "Headquarters - Floor 2",
      assignmentType: "INDIVIDUAL",
      assignedTo: "John Doe",
      employeeId: "EMP001",
      department: "Engineering",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-20"),
    },
    {
      id: "3",
      assetNumber: "05-00001",
      type: AssetType.MONITOR,
      state: AssetState.READY_TO_GO,
      serialNumber: "MON456789123",
      description: 'Dell UltraSharp 27" 4K',
      purchasePrice: 599.99,
      location: "Warehouse - Main",
      assignmentType: "SHARED",
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-18"),
    },
  ]);

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
            <TableRow key={asset.id}>
              <TableCell className="font-medium">
                <Link href={`/assets/${asset.id}`} className="hover:underline">
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
              <TableCell>{formatDate(asset.updatedAt)}</TableCell>
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
                      <Link href={`/assets/${asset.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/assets/${asset.id}/edit`}>
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
    </div>
  );
}
