// frontend/components/auth/protected-route.tsx

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

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading, session, userRole } = useAuth();
  const router = useRouter();

  console.log(
    "ProtectedRoute: loading=",
    loading,
    "user=",
    user ? "present" : "null",
    "userRole=",
    userRole,
    "requireAdmin=",
    requireAdmin
  );

  useEffect(() => {
    if (!loading) {
      console.log("ProtectedRoute: Not loading, checking auth...");
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to login");
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (requireAdmin) {
        // Check role from database (same as backend)
        console.log("ProtectedRoute: Checking admin role...");
        if (userRole !== "ADMIN") {
          console.log("ProtectedRoute: Not admin, redirecting to dashboard");
          // Redirect non-admins to dashboard
          router.push("/dashboard");
        }
      }
    }
  }, [user, loading, router, requireAdmin, session, userRole]);

  // Add a timeout fallback for loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("ProtectedRoute: Loading timeout, redirecting to login");
        router.push("/auth/login");
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    console.log("ProtectedRoute: Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not admin (handled by redirect)
  if (!user || (requireAdmin && userRole !== "ADMIN")) {
    console.log(
      "ProtectedRoute: Not rendering children - user:",
      user ? "present" : "null",
      "requireAdmin:",
      requireAdmin,
      "userRole:",
      userRole
    );
    return null;
  }

  console.log("ProtectedRoute: Rendering children");
  return <>{children}</>;
}

// Reasoning: This update simplifies the ProtectedRoute component by checking the admin role from user metadata instead of making a database call. This matches how the backend API routes check for admin roles and eliminates the potential for authentication issues that were causing the infinite loading spinner.
