// frontend/components/assets/asset-detail-modal.tsx

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

// Modal to display the detailed properties of a single asset.

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Asset as BaseAsset } from "@/components/search/search-results-modal";
import { AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";

// Extend Asset type to allow isArchived and archive metadata
type AssetWithArchive = BaseAsset & {
  isArchived: boolean;
  archiveReason: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
};

type AssetDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithArchive | null;
  isLoading: boolean;
};

// Utility function to map asset state to solid background color classes
const getStateColorClass = (state: AssetState) => {
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

export function AssetDetailModal({
  isOpen,
  onClose,
  asset,
  isLoading,
}: AssetDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isLoading
              ? "Loading Asset..."
              : asset
              ? `Details for ${asset.assetNumber}`
              : "Asset Not Found"}
          </DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Please wait while we fetch the asset details."
              : "Here is the detailed information for the selected asset."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <div className="text-center p-8">Loading...</div>}

        {!isLoading && !asset && (
          <div className="text-center p-8">Could not load asset details.</div>
        )}

        {!isLoading && asset && (
          <div className="border p-3 rounded-lg text-sm space-y-4">
            {/* Archived Asset Badge */}
            {asset.isArchived && (
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-gray-700 text-white">ARCHIVED ASSET</Badge>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-bold text-base">{asset.assetNumber}</span>
              <Badge className={getStateColorClass(asset.state)}>
                {ASSET_STATE_LABELS[asset.state]}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
              <div>{new Date(asset.updatedAt!).toLocaleString("en-GB")}</div>

              <div className="text-muted-foreground">Updated By:</div>
              <div>{asset.updatedByName}</div>
            </div>
            {/* Archive Metadata Section */}
            {asset.isArchived && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <div className="font-semibold text-gray-700 mb-1">
                  Archive Information
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-muted-foreground">Reason:</div>
                  <div>{asset.archiveReason || "N/A"}</div>
                  <div className="text-muted-foreground">
                    Archived By (User ID):
                  </div>
                  <div>{asset.archivedBy || "N/A"}</div>
                  <div className="text-muted-foreground">Archived At:</div>
                  <div>
                    {asset.archivedAt
                      ? new Date(asset.archivedAt).toLocaleString("en-GB")
                      : "N/A"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
