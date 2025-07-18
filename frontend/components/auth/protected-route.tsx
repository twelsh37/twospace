// frontend/components/auth/protected-route.tsx
// Protected route component for authentication

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
  const { user, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (requireAdmin) {
        // Check role from user metadata (same as backend)
        const role = user.user_metadata?.role;
        if (role !== "ADMIN") {
          // Redirect non-admins to dashboard
          router.push("/dashboard");
        }
      }
    }
  }, [user, loading, router, requireAdmin, session]);

  // Show loading state while checking authentication
  if (loading) {
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
  if (!user || (requireAdmin && user.user_metadata?.role !== "ADMIN")) {
    return null;
  }

  return <>{children}</>;
}

// Reasoning: This update simplifies the ProtectedRoute component by checking the admin role from user metadata instead of making a database call. This matches how the backend API routes check for admin roles and eliminates the potential for authentication issues that were causing the infinite loading spinner.
