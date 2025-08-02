// frontend/lib/auth-context.tsx

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

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClientComponentClient } from "./supabase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: "ADMIN" | "USER" | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    userData: Record<string, unknown>
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a single Supabase client instance for the auth context
const supabaseClient = createClientComponentClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "USER" | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  // Used to prevent repeated sign-outs in a single render cycle
  const [hasHandledInvalidToken, setHasHandledInvalidToken] = useState(false);

  // Clear old authentication cookies on mount
  useEffect(() => {
    // Clear any leftover Clerk or other auth cookies
    const clearOldAuthCookies = () => {
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const [name] = cookie.split("=");
        const trimmedName = name.trim();
        // Clear Clerk cookies and any other non-Supabase auth cookies
        if (
          trimmedName.startsWith("__clerk") ||
          (trimmedName.startsWith("sb-") === false &&
            trimmedName.includes("auth"))
        ) {
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    };

    clearOldAuthCookies();
  }, []);

  // Function to get user role from Supabase Auth metadata
  const getUserRole = (user: User | null): "ADMIN" | "USER" | null => {
    if (!user) return null;

    // Check user metadata for role
    const role = user.user_metadata?.role;
    if (role === "ADMIN" || role === "USER") {
      return role;
    }

    // Fallback: check if user is admin based on email (for backward compatibility)
    if (
      user.email === "tom.welsh@gtrailway.com" ||
      user.email === "tom.welsh@theaiaa.com"
    ) {
      return "ADMIN";
    }

    return "USER"; // Default to USER if no role specified
  };

  useEffect(() => {
    // Helper to handle invalid refresh token error gracefully
    const handleInvalidRefreshToken = async () => {
      // Only handle once per mount
      if (hasHandledInvalidToken) return;
      setHasHandledInvalidToken(true);
      console.log("Auth: Handling invalid refresh token");
      // Sign out to clear tokens
      await supabaseClient.auth.signOut();
      // Only redirect if not already on login page
      if (pathname && !pathname.startsWith("/auth/login")) {
        router.replace("/auth/login");
      }
    };

    // Get initial session with error handling and timeout
    const getInitialSession = async () => {
      console.log("Auth: Getting initial session...");

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("Auth: Session fetch timeout, setting loading to false");
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        clearTimeout(timeoutId);

        console.log(
          "Auth: Initial session result:",
          session ? "Session found" : "No session"
        );
        setSession(session);
        setUser(session?.user ?? null);

        // Set user role from Supabase Auth metadata
        const role = getUserRole(session?.user ?? null);
        console.log("Auth: User role:", role);
        setUserRole(role);

        setLoading(false);
        console.log("Auth: Loading set to false");
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        // Type guard for error object
        if (
          typeof error === "object" &&
          error !== null &&
          ("message" in error || "error_description" in error)
        ) {
          const message = error as {
            message?: string;
            error_description?: string;
          };
          console.log("Auth: Error details:", message);
          if (
            message.message?.includes("Invalid Refresh Token") ||
            message.error_description?.includes("Refresh Token Not Found")
          ) {
            // Handle invalid refresh token by signing out and redirecting
            await handleInvalidRefreshToken();
            return;
          }
        }
        // Other errors: log and set loading false
        console.error("Error fetching initial session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth: Auth state change event:",
        event,
        session ? "Session present" : "No session"
      );

      // Clear state first for sign out events
      if (event === "SIGNED_OUT") {
        console.log("Auth: Clearing state for sign out event");
        setUser(null);
        setSession(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Update state for other events
      setSession(session);
      setUser(session?.user ?? null);

      // Set user role from Supabase Auth metadata
      const role = getUserRole(session?.user ?? null);
      console.log("Auth: User role from auth change:", role);
      setUserRole(role);

      setLoading(false);
      console.log("Auth: Loading set to false from auth change");
      // If session is null, check for invalid refresh token error
      if (!session && !hasHandledInvalidToken) {
        // Try to fetch session to see if error is thrown
        try {
          await supabaseClient.auth.getSession();
        } catch (error: unknown) {
          // Type guard for error object
          if (
            typeof error === "object" &&
            error !== null &&
            ("message" in error || "error_description" in error)
          ) {
            const message = error as {
              message?: string;
              error_description?: string;
            };
            if (
              message.message?.includes("Invalid Refresh Token") ||
              message.error_description?.includes("Refresh Token Not Found")
            ) {
              await handleInvalidRefreshToken();
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient.auth, router, pathname, hasHandledInvalidToken]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Record<string, unknown>
  ) => {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { error };
  };

  const signOut = async () => {
    console.log("Auth: Signing out user...");
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setUserRole(null);
      setLoading(false);

      // Clear any stored auth data
      if (typeof window !== "undefined") {
        // Clear localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) {
            localStorage.removeItem(key);
          }
        });

        // Clear sessionStorage
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("sb-")) {
            sessionStorage.removeItem(key);
          }
        });
      }

      // Sign out from Supabase
      await supabaseClient.auth.signOut();
      console.log("Auth: Sign out successful, redirecting to login");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Auth: Error during sign out:", error);
      // Still clear state and redirect even if there's an error
      setUser(null);
      setSession(null);
      setUserRole(null);
      setLoading(false);
      router.replace("/auth/login");
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
