// frontend/app/api/users/route.test.ts
// Tests for users API route

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

import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { requireAuth } from "@/lib/supabase-auth-helpers"; // Mock dependencies
import { appLogger, systemLogger } from "@/lib/logger";
import { describe, it, expect, beforeEach } from "@jest/globals";
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            offset: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
  },
  usersTable: {
    id: "id",
    name: "name",
    email: "email",
    role: "role",
    departmentId: "departmentId",
    locationId: "locationId",
    isActive: "isActive",
    employeeId: "employeeId",
  },
  departmentsTable: {
    id: "id",
    name: "name",
  },
  locationsTable: {
    id: "id",
    name: "name",
  },
}));

jest.mock("@/lib/logger", () => ({
  systemLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  appLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/supabase-auth-helpers", () => ({
  requireAuth: jest.fn(),
  requireAdmin: jest.fn(),
}));

describe("Users API Route", () => {
  const mockRequireAuth = requireAuth;
  const mockAppLogger = appLogger;
  const mockSystemLogger = systemLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return users successfully with authentication", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "test@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAuth.mockResolvedValue(mockUser);

      const request = new NextRequest("http://localhost:3000/api/users");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "GET /api/users called. URL: http://localhost:3000/api/users"
      );
    });

    it("should handle authentication failure", async () => {
      // Arrange
      const authError = new NextResponse("Unauthorized", { status: 401 });
      mockRequireAuth.mockResolvedValue(authError);

      const request = new NextRequest("http://localhost:3000/api/users");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBe(authError);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });

    it("should handle pagination parameters", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "test@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAuth.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/users?page=2&limit=5"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });

    it("should handle department filter", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "test@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAuth.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/users?department=IT"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });

    it("should handle role filter", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "test@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAuth.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/users?role=ADMIN"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "test@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAuth.mockResolvedValue(mockUser);

      // Mock database error
      const { db } = await import("@/lib/db");
      db.select.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new NextRequest("http://localhost:3000/api/users");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      expect(mockSystemLogger.error).toHaveBeenCalled();
    });

    it("should handle missing authentication token", async () => {
      // Arrange
      const authError = new NextResponse("Unauthorized", { status: 401 });
      mockRequireAuth.mockResolvedValue(authError);

      const request = new NextRequest("http://localhost:3000/api/users");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBe(authError);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });
  });
});
