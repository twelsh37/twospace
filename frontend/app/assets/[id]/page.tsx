// frontend/app/assets/[id]/page.tsx
// Individual Asset Detail Page

import { AssetDetail } from "@/components/assets/asset-detail";
import { AssetStateTransition } from "@/components/assets/asset-state-transition";
import { AssetHistory } from "@/components/assets/asset-history";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface AssetDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AssetDetailPage({
  params,
}: AssetDetailPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center space-x-2">
        <Link href="/assets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assets
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asset Details</h2>
          <p className="text-muted-foreground">
            View and manage asset information and lifecycle
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/assets/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Details */}
        <div className="space-y-6">
          <AssetDetail assetId={id} />

          {/* State Transition Controls */}
          <AssetStateTransition assetId={id} />
        </div>

        {/* Asset History */}
        <div>
          <AssetHistory assetId={id} />
        </div>
      </div>
    </div>
  );
}
