// frontend/app/admin/configuration/page.tsx

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

import { Suspense } from "react";
import { ConfigurationManager } from "@/components/admin/configuration-manager";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Configuration Page
 *
 * This page provides access to the configuration manager for administrators
 * to customize the asset management system settings.
 */
export default function ConfigurationPage() {
  // For now, we'll use a default tenant ID
  // In a multi-tenant setup, this would come from the user's context
  const defaultTenantId = "default";

  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading configuration...</span>
              </div>
            </CardContent>
          </Card>
        }
      >
        <ConfigurationManager tenantId={defaultTenantId} />
      </Suspense>
    </div>
  );
}
