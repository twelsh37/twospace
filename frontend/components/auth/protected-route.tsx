// frontend/components/auth/protected-route.tsx
// Protected route component for authentication

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getUserById } from "@/lib/supabase-db";

// Define a minimal AppUser type for role-based checks
interface AppUser {
  role: string;
  // Add other fields as needed
}

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
  // State to hold the user's app record (including role)
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is authenticated, fetch their app user record from the users table
    if (user && requireAdmin) {
      setRoleLoading(true);
      setError(null);
      // Pass the access token if available
      const accessToken = session?.access_token;
      getUserById(user.id, accessToken)
        .then((result) => {
          setAppUser(result.data);
        })
        .catch((err) => {
          setAppUser(null);
          setError(
            `Failed to load user record: ${err?.message || String(err)}`
          );
          // Log the error for debugging
          console.error("ProtectedRoute getUserById error:", err);
        })
        .finally(() => setRoleLoading(false));
    }
  }, [user, requireAdmin, session]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (requireAdmin && !roleLoading && appUser) {
        if (appUser.role?.toLowerCase() !== "admin") {
          // Redirect non-admins to dashboard or another page
          router.push("/dashboard");
        }
      }
    }
  }, [user, loading, router, requireAdmin, appUser, roleLoading]);

  // Show loading state while checking authentication or role
  if (loading || (requireAdmin && (roleLoading || !appUser) && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-bold">Error loading user record</p>
          <pre className="text-xs whitespace-pre-wrap break-all">{error}</pre>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not admin (handled by redirect)
  if (
    !user ||
    (requireAdmin && (!appUser || appUser.role?.toLowerCase() !== "admin"))
  ) {
    return null;
  }

  return <>{children}</>;
}

// Reasoning: This update fetches the user's app record from the users table using their Supabase auth user ID. If requireAdmin is true, it checks the user's role and only allows access for admins. Non-admins are redirected. This ensures secure, auditable admin-only access using the roles stored in the database.
