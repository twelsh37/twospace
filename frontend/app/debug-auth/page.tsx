// frontend/app/debug-auth/page.tsx
// Debug page to troubleshoot authentication issues

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DebugAuthPage: React.FC = () => {
  const { user, session, loading, userRole } = useAuth();
  const [cookies, setCookies] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie
      .split(";")
      .map((cookie) => cookie.trim());
    setCookies(allCookies);

    // Get access token from session
    if (session?.access_token) {
      setAccessToken(session.access_token);
    }
  }, [session]);

  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const [name] = cookie.split("=");
      const trimmedName = name.trim();
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    window.location.reload();
  };

  const testHoldingAssetsAPI = async () => {
    try {
      const res = await fetch("/api/holding-assets", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await res.json();
      alert(
        `API Response Status: ${res.status}\nData: ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    } catch (error) {
      alert(`API Error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Authentication Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Auth State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Loading:</strong> {loading ? "Yes" : "No"}
          </p>
          <p>
            <strong>User:</strong> {user ? user.email : "None"}
          </p>
          <p>
            <strong>User Role:</strong> {userRole || "None"}
          </p>
          <p>
            <strong>Session:</strong> {session ? "Present" : "None"}
          </p>
          <p>
            <strong>Access Token:</strong>{" "}
            {accessToken ? `${accessToken.substring(0, 20)}...` : "None"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(user?.user_metadata, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browser Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {cookies.map((cookie, index) => (
              <div key={index} className="text-xs bg-gray-100 p-1 rounded">
                {cookie}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={clearAllCookies} variant="destructive">
          Clear All Cookies
        </Button>
        <Button onClick={testHoldingAssetsAPI}>Test Holding Assets API</Button>
      </div>
    </div>
  );
};

export default DebugAuthPage;
