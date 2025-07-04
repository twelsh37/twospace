// frontend/components/auth/protected-route.tsx
// Protected route component for authentication

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getUserById } from "@/lib/supabase-db";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  // State to hold the user's app record (including role)
  const [appUser, setAppUser] = useState<any>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    // If user is authenticated, fetch their app user record from the users table
    if (user && requireAdmin) {
      setRoleLoading(true);
      getUserById(user.id)
        .then((result) => {
          setAppUser(result.data);
        })
        .catch(() => {
          setAppUser(null);
        })
        .finally(() => setRoleLoading(false));
    }
  }, [user, requireAdmin]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (requireAdmin && !roleLoading) {
        // If admin is required, check the user's role
        if (!appUser || appUser.role !== "ADMIN") {
          // Redirect non-admins to dashboard or another page
          router.push("/dashboard");
        }
      }
    }
  }, [user, loading, router, requireAdmin, appUser, roleLoading]);

  // Show loading state while checking authentication or role
  if (loading || (requireAdmin && (roleLoading || !appUser))) {
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
  if (!user || (requireAdmin && (!appUser || appUser.role !== "ADMIN"))) {
    return null;
  }

  return <>{children}</>;
}

// Reasoning: This update fetches the user's app record from the users table using their Supabase auth user ID. If requireAdmin is true, it checks the user's role and only allows access for admins. Non-admins are redirected. This ensures secure, auditable admin-only access using the roles stored in the database.
