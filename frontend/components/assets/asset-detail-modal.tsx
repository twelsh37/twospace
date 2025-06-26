// frontend/components/assets/asset-detail-modal.tsx
// Modal to display the detailed properties of a single asset.

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Asset as DetailedAsset } from "@/components/search/search-results-modal"; // Re-using the detailed type
import { AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";

type AssetDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  asset: DetailedAsset | null;
  isLoading: boolean;
};

// Utility function to map asset state to solid background color classes
const getStateColorClass = (state: AssetState) => {
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white";
    case AssetState.BUILT:
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
