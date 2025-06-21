// frontend/components/dashboard/quick-actions.tsx
// Quick Actions Component for Dashboard

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Upload, Download, MoreHorizontal } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex items-center space-x-2">
      {/* Primary Actions */}
      <Link href="/assets/new">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </Link>

      <Link href="/import">
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </Link>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/reports">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/users/new">Add User</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/locations/new">Add Location</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
