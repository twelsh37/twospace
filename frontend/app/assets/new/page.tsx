// frontend/app/assets/new/page.tsx
// New Asset Creation Page

import { AssetForm } from "@/components/assets/asset-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAssetPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Add New Asset</h2>
          <p className="text-muted-foreground">
            Create a new asset record and add it to your inventory
          </p>
        </div>
      </div>

      {/* Asset Creation Form */}
      <div className="max-w-2xl">
        <AssetForm mode="create" />
      </div>
    </div>
  );
}
