// frontend/app/api/test-auth/route.test.ts
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { requireAdmin } from "@/lib/supabase-auth-helpers";// Mock dependencies
jest.mock("@/lib/supabase-auth-helpers", () => ({
  requireAdmin: jest.fn(),
}));

describe("Test Auth API Route", () => {
  const mockRequireAdmin = requireAdmin;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/test-auth", () => {
    it("should return success for valid admin authentication", async () => {
      // Arrange
      const mockUser = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };

      mockRequireAdmin.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        message: "Authentication successful",
        user: {
          id: "admin1",
          email: "admin@example.com",
          role: "ADMIN",
        },
      });
    });

    it("should return error for authentication failure", async () => {
      // Arrange
      mockRequireAdmin.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      });

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Unauthorized",
        authError: "Invalid token",
      });
    });

    it("should return error for missing user", async () => {
      // Arrange
      mockRequireAdmin.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Unauthorized",
        authError: "No user found",
      });
    });

    it("should handle authentication errors gracefully", async () => {
      // Arrange
      const mockError = new Error("Authentication service unavailable");
      mockRequireAdmin.mockRejectedValue(mockError);

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Authentication test failed",
        details: "Authentication service unavailable",
      });
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const mockError = "Unknown error string";
      mockRequireAdmin.mockRejectedValue(mockError);

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Authentication test failed",
        details: "Unknown error",
      });
    });

    it("should handle user without role metadata", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: {}, // No role
      };

      mockRequireAdmin.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        message: "Authentication successful",
        user: {
          id: "user1",
          email: "user@example.com",
          role: undefined,
        },
      });
    });

    it("should handle user with null metadata", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: null,
      };

      mockRequireAdmin.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        message: "Authentication successful",
        user: {
          id: "user1",
          email: "user@example.com",
          role: undefined,
        },
      });
    });

    it("should handle user with USER role", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: { role: "USER" },
      };

      mockRequireAdmin.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/test-auth");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        message: "Authentication successful",
        user: {
          id: "user1",
          email: "user@example.com",
          role: "USER",
        },
      });
    });
  });
});
