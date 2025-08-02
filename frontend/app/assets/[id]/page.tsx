"use client";
// frontend/app/assets/[id]/page.tsx
// Individual asset detail page

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

import { useState, useEffect, use, useCallback } from "react";
import { AssetDetail } from "@/components/assets/asset-detail";
import { AssetStateTransition } from "@/components/assets/asset-state-transition";
import { AssetHistory } from "@/components/assets/asset-history";
import { AssetEditModal } from "@/components/assets/asset-edit-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useRouter } from "next/navigation";
import { Asset } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const router = useRouter();
  // Use id from params (use() needed in Next.js 15)
  const { id } = use(params);
  const { session } = useAuth();
  const { userRole } = useAuth();
  const currentUserRole = userRole || "USER";
  const isUser = currentUserRole === "USER";

  // Fetch asset data function
  const fetchAsset = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch asset");
      const json = await res.json();
      setAsset(json.data as Asset);
    } catch {
      setAsset(null);
    }
  }, [id]);

  // Fetch asset data once for all subcomponents
  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  // Handler for delete confirmation
  const handleDeleteConfirmed = async (reason: string, comment: string) => {
    setDeleting(true);
    try {
      // Attach Authorization header if access token is available
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      await fetch(`/api/assets/${id}`, {
        method: "DELETE",
        headers,
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            title="Edit Asset"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
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

      {/* Asset Edit Modal */}
      <AssetEditModal
        assetNumber={asset?.assetNumber || null}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={() => {
          // Refetch asset data after edit
          fetchAsset();
        }}
      />

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
