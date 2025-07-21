// frontend/components/holding-assets/HoldingAssetsTable.tsx

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

import React, { useEffect, useState, useCallback } from "react";
import EditHoldingAssetModal from "./EditHoldingAssetModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

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

  // Get auth context
  const { session } = useAuth();

  // Fetch holding assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      if (!session?.access_token) {
        console.log("No access token available for holding assets fetch");
        setAssets([]);
        return;
      }

      const res = await fetch("/api/holding-assets", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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
  }, [session]);

  useEffect(() => {
    if (session?.access_token) {
      fetchAssets();
    }
  }, [session, fetchAssets]);

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
