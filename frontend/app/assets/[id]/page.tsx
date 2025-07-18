"use client";
// frontend/app/assets/[id]/page.tsx
// Individual Asset Detail Page
//
// NOTE: Next.js 15 dynamic route pages must use params as a Promise and unwrap with use().

import { useState, useEffect } from "react";
import { AssetDetail } from "@/components/assets/asset-detail";
import { AssetStateTransition } from "@/components/assets/asset-state-transition";
import { AssetHistory } from "@/components/assets/asset-history";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useRouter } from "next/navigation";
import { Asset } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function Page({ params }: { params: { id: string } }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const router = useRouter();
  // Use id directly from params (no use() needed)
  const { id } = params;
  const { session } = useAuth();
  const userRole = session?.user?.user_metadata?.role?.toUpperCase() || "USER";
  const isUser = userRole === "USER";

  // Fetch asset data once for all subcomponents
  useEffect(() => {
    async function fetchAsset() {
      try {
        const res = await fetch(`/api/assets/${id}`);
        if (!res.ok) throw new Error("Failed to fetch asset");
        const json = await res.json();
        setAsset(json.data as Asset);
      } catch {
        setAsset(null);
      }
    }
    fetchAsset();
  }, [id]);

  // Handler for delete confirmation
  const handleDeleteConfirmed = async (reason: string, comment: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/assets/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveReason: reason,
          comment: comment,
          userId: "e3b03291-90f0-4cbd-a230-4727e2deb683", // TEMP: Use real admin UUID
        }),
      });
      setDeleteModalOpen(false);
      router.push("/assets");
    } catch {
      setDeleting(false);
    }
    setDeleting(false);
  };

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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            disabled={isUser}
            title={
              isUser ? "You do not have permission to delete assets." : "Delete"
            }
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-400" />
            Delete
          </Button>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirmed}
        loading={deleting}
        title="Delete Asset"
        description={
          "This action cannot be undone. Please select a reason for deletion."
        }
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Details */}
        <div className="space-y-6">
          {asset && <AssetDetail asset={asset} />}
          {/* Only show state transition if asset exists */}
          {asset && <AssetStateTransition asset={asset} setAsset={setAsset} />}
        </div>
        {/* Only show asset history if asset exists */}
        <div>{asset && <AssetHistory assetNumber={asset.assetNumber} />}</div>
      </div>
    </div>
  );
}
