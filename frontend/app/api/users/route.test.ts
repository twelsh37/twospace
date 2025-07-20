// frontend/app/api/users/route.test.ts
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { requireAuth } from "@/lib/supabase-auth-helpers"; // Mock dependencies
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
