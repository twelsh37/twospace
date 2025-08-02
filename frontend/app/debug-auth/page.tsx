// frontend/app/debug-auth/page.tsx
// Debug page for authentication testing

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

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DebugAuthPage() {
  const { user, session, loading, userRole, signIn, signOut } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toISOString()}: ${result}`,
    ]);
  };

  const testAuthAPI = async () => {
    try {
      const res = await fetch("/api/test-auth");
      const data = await res.json();
      addTestResult(`Auth API: ${res.status} - ${JSON.stringify(data)}`);
    } catch (error) {
      addTestResult(`Auth API Error: ${error}`);
    }
  };

  const testHoldingAssetsAPI = async () => {
    try {
      const res = await fetch("/api/holding-assets");
      const data = await res.json();
      addTestResult(
        `Holding Assets API: ${res.status} - ${JSON.stringify(data)}`
      );
    } catch (error) {
      addTestResult(`Holding Assets API Error: ${error}`);
    }
  };

  const testLogout = async () => {
    addTestResult("Testing logout functionality...");
    try {
      await signOut();
      addTestResult("Logout successful");
    } catch (error) {
      addTestResult(`Logout error: ${error}`);
    }
  };

  const testDashboardAPI = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      addTestResult(`Dashboard API: ${res.status} - ${JSON.stringify(data)}`);
    } catch (error) {
      addTestResult(`Dashboard API Error: ${error}`);
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    addTestResult("Starting authentication tests...");

    // Test environment variables
    addTestResult(
      `NEXT_PUBLIC_SUPABASE_URL: ${
        process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"
      }`
    );
    addTestResult(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"
      }`
    );

    // Test auth state
    addTestResult(`Loading: ${loading}`);
    addTestResult(`User: ${user ? "Present" : "None"}`);
    addTestResult(`Session: ${session ? "Present" : "None"}`);
    addTestResult(`User Role: ${userRole || "None"}`);

    // Test APIs
    await testAuthAPI();
    await testDashboardAPI();
    await testHoldingAssetsAPI();

    addTestResult("Tests completed.");
    setIsTesting(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Current Auth State</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <Badge variant={loading ? "destructive" : "default"}>
                      Loading: {loading ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant={user ? "default" : "secondary"}>
                      User: {user ? "Present" : "None"}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant={session ? "default" : "secondary"}>
                      Session: {session ? "Present" : "None"}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant={userRole ? "default" : "secondary"}>
                      Role: {userRole || "None"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">User Details</h3>
                <div className="text-sm space-y-1">
                  {user ? (
                    <>
                      <div>
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div>
                        <strong>ID:</strong> {user.id}
                      </div>
                      <div>
                        <strong>Role:</strong> {userRole}
                      </div>
                      <div>
                        <strong>Metadata:</strong>{" "}
                        {JSON.stringify(user.user_metadata)}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">No user logged in</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={runAllTests} disabled={isTesting}>
                {isTesting ? "Running Tests..." : "Run All Tests"}
              </Button>
              <Button onClick={testAuthAPI} variant="outline">
                Test Auth API
              </Button>
              <Button onClick={testDashboardAPI} variant="outline">
                Test Dashboard API
              </Button>
              <Button onClick={testHoldingAssetsAPI} variant="outline">
                Test Holding Assets API
              </Button>
              <Button onClick={testLogout} variant="destructive">
                Test Logout
              </Button>
            </div>

            {testResults.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Test Results</h3>
                <div className="bg-gray-100 p-4 rounded text-sm max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
