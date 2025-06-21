// frontend/components/search/search-results-modal.tsx
// Modal to display global search results.

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Asset as BaseAsset, User, Location } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export type Asset = BaseAsset & {
  locationName: string | null;
  updatedByName: string;
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
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Results for &quot;{query}&quot;</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Searching..."
              : hasResults
              ? "Found the following results."
              : "No results found."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <div>Loading...</div>}

        {!isLoading && !hasResults && <div>No items match your search.</div>}

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
              <div className="space-y-4 p-1">
                {results.assets.map((asset) => (
                  <div
                    key={asset.assetNumber}
                    className="border p-3 rounded-lg text-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base">
                        {asset.assetNumber}
                      </span>
                      <Badge variant="outline">
                        {asset.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="text-muted-foreground">Location:</div>
                      <div>{asset.locationName || "N/A"}</div>

                      <div className="text-muted-foreground">Assigned To:</div>
                      <div>{asset.assignedTo || "Unassigned"}</div>

                      <div className="text-muted-foreground">Cost:</div>
                      <div>
                        {new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          currency: "GBP",
                        }).format(parseFloat(asset.purchasePrice))}
                      </div>

                      <div className="text-muted-foreground">Last Update:</div>
                      <div>
                        {new Date(asset.updatedAt!).toLocaleString("en-GB")}
                      </div>

                      <div className="text-muted-foreground">Updated By:</div>
                      <div>{asset.updatedByName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="users" className="flex-grow overflow-y-auto">
              <div className="space-y-2">
                {results.users.map((user) => (
                  <div key={user.id} className="border p-2 rounded">
                    <p className="font-bold">{user.name}</p>
                    <p>{user.email}</p>
                    <p>Department: {user.department}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent
              value="locations"
              className="flex-grow overflow-y-auto"
            >
              <div className="space-y-2">
                {results.locations.map((location) => (
                  <div key={location.id} className="border p-2 rounded">
                    <p className="font-bold">{location.name}</p>
                    <p>{location.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
