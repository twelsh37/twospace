// frontend/app/assets/new/page.tsx
// New Asset Creation Page

"use client";

import { AssetForm } from "@/components/assets/asset-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAssetPage() {
  return (
    // Outer container for page padding and spacing
    <div className="flex-1 flex flex-col pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8">
      {/* Background card container */}
      <Card
        style={{
          maxWidth: 900,
          width: "100%",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
      >
        <CardHeader className="pb-2">
          {/* Page Header */}
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/assets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assets
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                style={{
                  fontSize: "2rem",
                  textAlign: "left",
                  marginBottom: 0,
                  lineHeight: 1.1,
                }}
              >
                Add New Asset
              </CardTitle>
              <p
                className="text-muted-foreground"
                style={{ marginTop: 2, marginBottom: 0 }}
              >
                Create a new asset record and add it to your inventory
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Asset Creation Form */}
          <div className="max-w-2xl">
            <AssetForm mode="create" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
