// frontend/components/assets/asset-actions.tsx
// Asset Actions Component for bulk operations

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Move,
  Trash2,
  FileText,
  Mail,
  Archive,
} from "lucide-react";

export function AssetActions() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // TODO: This would be connected to asset table selection
  const hasSelectedAssets = selectedAssets.length > 0;

  const handleBulkAction = () => {
    // TODO: Implement bulk actions
  };

  if (!hasSelectedAssets) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedAssets.length} asset{selectedAssets.length > 1 ? "s" : ""}{" "}
          selected
        </span>
        <Badge variant="secondary">{selectedAssets.length}</Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <Button variant="outline" size="sm" onClick={handleBulkAction}>
          <Move className="mr-2 h-4 w-4" />
          Move Location
        </Button>

        <Button variant="outline" size="sm" onClick={handleBulkAction}>
          <FileText className="mr-2 h-4 w-4" />
          Export
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleBulkAction}>
              <Mail className="mr-2 h-4 w-4" />
              Bulk Assign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBulkAction}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Assets
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleBulkAction}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-400" />
              Delete Assets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Selection */}
        <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])}>
          Clear Selection
        </Button>
      </div>
    </div>
  );
}
