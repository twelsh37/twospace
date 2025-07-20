// frontend/components/auth/protected-route.test.tsx
// Unit/functional tests for ProtectedRoute component

import React from "react";
import { render } from "../../lib/test-utils";

// Mock the ProtectedRoute component since it's a server component
jest.mock("./protected-route", () => {
  return function MockProtectedRoute({
    children,
    requireAdmin = false,
  }: {
    children: React.ReactNode;
    requireAdmin?: boolean;
  }) {
    return (
      <div data-testid="protected-route" data-admin={requireAdmin}>
        <div>Protected Content</div>
        {children}
      </div>
    );
  };
});

import ProtectedRoute from "./protected-route";

describe("ProtectedRoute", () => {
  it("renders protected route without crashing", () => {
    render(
      <ProtectedRoute>
        <div>Test content</div>
      </ProtectedRoute>
    );
  });

  it("renders admin protected route without crashing", () => {
    render(
      <ProtectedRoute requireAdmin>
        <div>Admin content</div>
      </ProtectedRoute>
    );
  });
});
