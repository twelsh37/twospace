// frontend/components/search/search-results-modal.tsx

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

// Modal to display global search results with expandable detail views.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Asset as BaseAsset, User, Location } from "@/lib/types";

import { useRouter } from "next/navigation";

// Extend Asset type to include search API fields
export type Asset = BaseAsset & {
  locationName: string | null;
  updatedByName: string;
  isArchived: boolean;
  archiveReason: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
};

export type SearchResults = {
  assets: Asset[];
  users: User[];
  locations: Location[];
};

type SearchResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResults | null;
  isLoading: boolean;
  query: string;
};

// Expandable Asset Component
function ExpandableAsset({
  asset,
  onClose,
}: {
  asset: Asset;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleViewDetails = () => {
    onClose(); // Close the modal first
    router.push(`/assets/${asset.assetNumber}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header - Clickable to navigate to full details */}
      <div
        className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={handleViewDetails}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-gray-500" />
            <span className="font-bold text-base">{asset.assetNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            {asset.isArchived && (
              <Badge className="bg-gray-700 text-white text-xs">ARCHIVED</Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {asset.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Quick info always visible */}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="text-muted-foreground">Location:</div>
          <div>{asset.locationName || "N/A"}</div>
          <div className="text-muted-foreground">Assigned To:</div>
          <div>
            {asset.isArchived ? "Unassigned" : asset.assignedTo || "Unassigned"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Expandable User Component
function ExpandableUser({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleViewDetails = () => {
    onClose(); // Close the modal first
    router.push(`/users/${user.id}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header - Clickable to navigate to full details */}
      <div
        className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={handleViewDetails}
      >
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Quick info always visible */}
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Department: </span>
          <span>{user.department}</span>
        </div>
      </div>
    </div>
  );
}

// Expandable Location Component
function ExpandableLocation({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleViewDetails = () => {
    onClose(); // Close the modal first
    router.push(`/locations/${location.id}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header - Clickable to navigate to full details */}
      <div
        className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={handleViewDetails}
      >
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-bold">{location.name}</p>
            <p className="text-sm text-muted-foreground">
              {location.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsModal({
  isOpen,
  onClose,
  results,
  isLoading,
  query,
}: SearchResultsModalProps) {
  const hasResults =
    results &&
    (results.assets.length > 0 ||
      results.users.length > 0 ||
      results.locations.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Results for &quot;{query}&quot;</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Searching..."
              : hasResults
              ? "Click on any item to view its full details page."
              : "No results found."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-sm text-gray-600">Searching...</div>
            </div>
          </div>
        )}

        {!isLoading && !hasResults && (
          <div className="flex items-center justify-center p-8 text-gray-500">
            No items match your search.
          </div>
        )}

        {!isLoading && hasResults && (
          <Tabs
            defaultValue="assets"
            className="w-full flex-grow flex flex-col min-h-0"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="assets"
                disabled={results.assets.length === 0}
              >
                Assets <Badge className="ml-2">{results.assets.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="users" disabled={results.users.length === 0}>
                Users <Badge className="ml-2">{results.users.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="locations"
                disabled={results.locations.length === 0}
              >
                Locations{" "}
                <Badge className="ml-2">{results.locations.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="flex-grow overflow-y-auto">
              <div className="space-y-3 p-1">
                {results.assets.map((asset) => (
                  <ExpandableAsset
                    key={asset.assetNumber}
                    asset={asset}
                    onClose={onClose}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="flex-grow overflow-y-auto">
              <div className="space-y-3 p-1">
                {results.users.map((user) => (
                  <ExpandableUser key={user.id} user={user} onClose={onClose} />
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="locations"
              className="flex-grow overflow-y-auto"
            >
              <div className="space-y-3 p-1">
                {results.locations.map((location) => (
                  <ExpandableLocation
                    key={location.id}
                    location={location}
                    onClose={onClose}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
