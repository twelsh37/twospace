// frontend/app/assets/new/page.tsx
// New asset creation page

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

"use client";

import { AssetForm } from "@/components/assets/asset-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function NewAssetPage() {
  const { session } = useAuth(); // Get session from auth context
  return (
    // Outer container for page padding and spacing
    <div className="flex-1 flex flex-col pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8">
      {/* Background card container */}
      <Card
        style={{
          maxWidth: 800,
          width: "fit-content",
          margin: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          borderRadius: 16,
        }}
      >
        {/* CardHeader now uses the provided class for layout and spacing consistency */}
        <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 px-8 py-4">
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

        <CardContent className="pt-0 px-8 pb-8">
          {/* Asset Creation Form */}
          <AssetForm mode="create" session={session} />
        </CardContent>
      </Card>
    </div>
  );
}
