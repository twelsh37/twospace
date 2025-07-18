"use client";
// frontend/app/debug-auth/page.tsx
// Debug page to test authentication

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import type { Session } from "@supabase/supabase-js";

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<{
    session?: Session | null;
    error?: unknown;
  } | null>(null);
  const [result, setResult] = useState<object | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth state...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("Session check result:", { session, error });
        setAuthState({ session, error });
      } catch (err) {
        console.error("Error checking auth:", err);
        setAuthState({ error: err });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const testAuth = async () => {
    setTestLoading(true);
    try {
      console.log("=== TESTING AUTH ===");
      console.log("Auth state:", authState);

      if (!authState?.session?.access_token) {
        setResult({ error: "No access token in session" });
        return;
      }

      const response = await fetch("/api/debug-user", {
        headers: {
          Authorization: `Bearer ${authState.session.access_token}`,
        },
      });

      const data = await response.json();
      console.log("Debug endpoint response:", data);
      setResult(data);
    } catch (error) {
      console.error("Auth test error:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
        <div className="text-lg">Loading authentication state...</div>
        <div className="text-sm text-gray-600 mt-2">
          This might take a moment if there are authentication issues.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Auth State:</h2>
        <div className="mb-2">
          <strong>Loading:</strong> {loading ? "Yes" : "No"}
        </div>
        <div className="mb-2">
          <strong>Session:</strong> {authState?.session ? "Present" : "None"}
        </div>
        <div className="mb-2">
          <strong>Access Token:</strong>{" "}
          {authState?.session?.access_token ? "Present" : "Missing"}
        </div>
        <div className="mb-2">
          <strong>Error:</strong> {authState?.error ? "Yes" : "No"}
        </div>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>

      <Button onClick={testAuth} disabled={testLoading} className="mb-4">
        {testLoading ? "Testing..." : "Test Authentication"}
      </Button>

      {result && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Test Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
