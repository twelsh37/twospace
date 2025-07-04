// frontend/components/auth/protected-route.test.tsx
// Tests for ProtectedRoute component

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "./protected-route";
import * as AuthContext from "@/lib/auth-context";
import { getUserById } from "@/lib/supabase-db";

// Mock next/navigation router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock getUserById from supabase-db
jest.mock("@/lib/supabase-db", () => ({
  getUserById: jest.fn(),
}));

// Mock the Supabase client to avoid requiring env vars or real network calls
jest.mock("@/lib/supabase", () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  })),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

// Helper to mock AuthContext
function mockAuthContext({
  user,
  loading,
}: {
  user: { id: string } | null;
  loading: boolean;
}) {
  jest.spyOn(AuthContext, "useAuth").mockReturnValue({
    user,
    loading,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    session: null,
  });
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login if not authenticated", async () => {
    mockAuthContext({ user: null, loading: false });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("renders children if authenticated and no admin required", async () => {
    mockAuthContext({ user: { id: "user-1" }, loading: false });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to dashboard if not admin when requireAdmin is true", async () => {
    mockAuthContext({ user: { id: "user-2" }, loading: false });
    jest.mocked(getUserById).mockResolvedValue({ data: { role: "USER" } });
    render(
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders children if admin when requireAdmin is true", async () => {
    mockAuthContext({ user: { id: "admin-1" }, loading: false });
    jest.mocked(getUserById).mockResolvedValue({ data: { role: "ADMIN" } });
    render(
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    await waitFor(() => {
      expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });
  });

  it("shows loading state while loading", () => {
    mockAuthContext({ user: null, loading: true });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});

// Reasoning: These tests cover the main scenarios for ProtectedRoute: unauthenticated redirect, authenticated access, admin-only access, and loading state. Mocks are used for auth context, router, user fetching, and the Supabase client for isolation and reliability.
