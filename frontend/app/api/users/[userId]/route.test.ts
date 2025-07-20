// frontend/app/api/users/[userId]/route.test.ts
import { NextResponse } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/db";
import { appLogger, systemLogger } from "@/lib/logger";
// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => Promise.resolve([])),
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

describe("Single User API Route", () => {
  const mockDb = db;
  const mockAppLogger = appLogger;
  const mockSystemLogger = systemLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/[userId]", () => {
    it("should return user details successfully", async () => {
      // Arrange
      const mockUser = [
        {
          id: "user1",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "USER",
          department: "Information Technology",
          location: "Office A",
          isActive: true,
          employeeId: "EMP001",
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(mockUser),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/users/user1");
      const params = Promise.resolve({ userId: "user1" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockUser[0],
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "GET /api/users/[userId] called"
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith("Fetching user by ID", {
        userId: "user1",
      });
    });

    it("should return error for missing user ID", async () => {
      // Arrange
      const request = new Request("http://localhost:3000/api/users/");
      const params = Promise.resolve({ userId: "" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        error: "User ID is required",
      });

      expect(mockAppLogger.warn).toHaveBeenCalledWith(
        "User ID is required in GET /api/users/[userId]"
      );
    });

    it("should return 404 when user not found", async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const request = new Request(
        "http://localhost:3000/api/users/nonexistent"
      );
      const params = Promise.resolve({ userId: "nonexistent" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toEqual({
        error: "User not found",
      });

      expect(mockAppLogger.warn).toHaveBeenCalledWith(
        "User not found in GET /api/users/[userId]",
        { userId: "nonexistent" }
      );
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockError = new Error("Database connection failed");
      mockDb.select.mockImplementation(() => {
        throw mockError;
      });

      const request = new Request("http://localhost:3000/api/users/user1");
      const params = Promise.resolve({ userId: "user1" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch user",
        details: "Database connection failed",
      });

      expect(mockSystemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching user:")
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const mockError = "Unknown error string";
      mockDb.select.mockImplementation(() => {
        throw mockError;
      });

      const request = new Request("http://localhost:3000/api/users/user1");
      const params = Promise.resolve({ userId: "user1" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch user",
        details: "Unknown error",
      });
    });

    it("should handle user with inactive status", async () => {
      // Arrange
      const mockUser = [
        {
          id: "user1",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "USER",
          department: "Information Technology",
          location: "Office A",
          isActive: false,
          employeeId: "EMP001",
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(mockUser),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/users/user1");
      const params = Promise.resolve({ userId: "user1" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockUser[0],
      });
    });

    it("should handle admin user role", async () => {
      // Arrange
      const mockUser = [
        {
          id: "admin1",
          name: "Admin User",
          email: "admin@example.com",
          role: "ADMIN",
          department: "Management",
          location: "Head Office",
          isActive: true,
          employeeId: "ADM001",
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(mockUser),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/users/admin1");
      const params = Promise.resolve({ userId: "admin1" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockUser[0],
      });
    });

    it("should handle special characters in user ID", async () => {
      // Arrange
      const mockUser = [
        {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          role: "USER",
          department: "IT",
          location: "Office",
          isActive: true,
          employeeId: "EMP-123",
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(mockUser),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/users/user-123");
      const params = Promise.resolve({ userId: "user-123" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockUser[0],
      });
    });

    it("should handle UUID format user IDs", async () => {
      // Arrange
      const mockUser = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "UUID User",
          email: "uuid@example.com",
          role: "USER",
          department: "IT",
          location: "Office",
          isActive: true,
          employeeId: "EMP001",
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(mockUser),
            }),
          }),
        }),
      });

      const request = new Request(
        "http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000"
      );
      const params = Promise.resolve({
        userId: "550e8400-e29b-41d4-a716-446655440000",
      });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockUser[0],
      });
    });
  });
});
