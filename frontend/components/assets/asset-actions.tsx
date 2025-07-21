// frontend/components/assets/asset-actions.tsx

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
  const hasSelectedAssets = selectedAssets && selectedAssets.length > 0;

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
