// frontend/components/holding-assets/HoldingAssetsTable.tsx
import React, { useEffect, useState } from "react";
import EditHoldingAssetModal from "./EditHoldingAssetModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface HoldingAsset {
  id: string;
  serialNumber: string;
  description: string;
  supplier?: string;
  status?: string;
  notes?: string;
}

const PAGE_SIZE = 10;

const HoldingAssetsTable: React.FC = () => {
  const [assets, setAssets] = useState<HoldingAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<HoldingAsset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch holding assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/holding-assets", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.data.assets || []);
      } else {
        setAssets([]);
      }
    } catch {
      setAssets([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Pagination logic
  const totalAssets = assets.length;
  const totalPages = Math.ceil(totalAssets / PAGE_SIZE);
  const pagedAssets = assets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handler for edit/assign
  const handleEdit = (asset: HoldingAsset) => {
    setSelectedAsset(asset);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAsset(null);
  };

  const handleModalSuccess = () => {
    fetchAssets();
    handleModalClose();
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2 text-center">Holding Assets</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : totalAssets === 0 ? (
        <div className="text-center py-4">No assets in holding.</div>
      ) : (
        <>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left font-medium bg-gray-50">
                  Serial Number
                </th>
                <th className="border-b px-4 py-2 text-left font-medium bg-gray-50">
                  Description
                </th>
                <th className="border-b px-4 py-2 text-left font-medium bg-gray-50">
                  Supplier
                </th>
                <th className="border-b px-4 py-2 text-left font-medium bg-gray-50">
                  Status
                </th>
                <th className="border-b px-4 py-2 text-left font-medium bg-gray-50">
                  Notes
                </th>
                <th className="border-b px-4 py-2 text-left font-medium bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedAssets.map((asset) => (
                <tr key={asset.id} className="even:bg-gray-50">
                  <td className="px-4 py-2 border-b">{asset.serialNumber}</td>
                  <td className="px-4 py-2 border-b">{asset.description}</td>
                  <td className="px-4 py-2 border-b">{asset.supplier || ""}</td>
                  <td className="px-4 py-2 border-b">
                    {asset.status || "pending"}
                  </td>
                  <td className="px-4 py-2 border-b">{asset.notes || ""}</td>
                  <td className="px-4 py-2 border-b">
                    <Button size="sm" onClick={() => handleEdit(asset)}>
                      Edit / Assign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 mt-3 gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {pagedAssets.length} of {totalAssets} assets
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 disabled:bg-gray-400 disabled:border-gray-400"
                aria-label="Previous page"
                title="Previous page"
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 disabled:bg-gray-400 disabled:border-gray-400"
                aria-label="Next page"
                title="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      {/* Edit/Assign Modal */}
      {modalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <EditHoldingAssetModal
              asset={selectedAsset}
              onClose={handleModalClose}
              onSuccess={handleModalSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldingAssetsTable;
