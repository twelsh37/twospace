// frontend/components/holding-assets/HoldingAssetsTable.tsx
import React, { useEffect, useState } from "react";
import EditHoldingAssetModal from "./EditHoldingAssetModal";
import { Button } from "@/components/ui/button";

interface HoldingAsset {
  id: string;
  serialNumber: string;
  description: string;
  supplier?: string;
  status?: string;
  notes?: string;
}

const HoldingAssetsTable: React.FC = () => {
  const [assets, setAssets] = useState<HoldingAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<HoldingAsset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch holding assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/holding-assets");
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
      ) : assets.length === 0 ? (
        <div className="text-center py-4">No assets in holding.</div>
      ) : (
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
            {assets.map((asset) => (
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
