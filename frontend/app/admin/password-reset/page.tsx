// frontend/app/admin/password-reset/page.tsx

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

"use client";

import React from "react";
import { AdminPasswordReset } from "@/components/admin/admin-password-reset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPasswordResetPage() {
  const handleSuccess = (newPassword: string) => {
    console.log("Password reset successful:", newPassword);
    // You could show a toast notification here
  };

  const handleError = (error: string) => {
    console.error("Password reset failed:", error);
    // You could show a toast notification here
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Password Reset</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Password Reset Form */}
          <div>
            <AdminPasswordReset
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>

          {/* Instructions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>How to Reset User Passwords</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Method 1: User-Initiated Reset
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Users can reset their own passwords by requesting a reset
                    email:
                  </p>
                  <code className="bg-gray-100 p-2 rounded text-sm block">
                    const {resetPassword} = useAuth();
                    <br />
                    await resetPassword("user@example.com");
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Method 2: Admin-Initiated Reset
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Admins can reset passwords directly using the form on the
                    left. This generates a new secure password.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Security Notes</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Only admin users can reset other users' passwords</li>
                    <li>
                      • New passwords are generated securely with 12 characters
                    </li>
                    <li>
                      • Passwords include uppercase, lowercase, numbers, and
                      symbols
                    </li>
                    <li>
                      • Provide the new password to the user through a secure
                      channel
                    </li>
                    <li>
                      • Users should change their password after first login
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Environment Setup
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Make sure you have the{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      SUPABASE_SERVICE_ROLE_KEY
                    </code>
                    environment variable set for admin operations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
