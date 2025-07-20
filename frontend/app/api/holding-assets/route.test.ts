// frontend/app/api/holding-assets/route.test.ts
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { requireAuth } from "@/lib/supabase-auth-helpers";import { db } from "@/lib/db";
import { appLogger, systemLogger } from "@/lib/logger";
// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => Promise.resolve([])),
    })),
  },
  holdingAssetsTable: {
    id: "id",
    assetNumber: "assetNumber",
    type: "type",
    description: "description",
    serialNumber: "serialNumber",
    purchasePrice: "purchasePrice",
    locationId: "locationId",
    state: "state",
    status: "status",
    createdAt: "createdAt",
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
}));

describe("Holding Assets API Route", () => {
  const mockDb = db;
  const mockRequireAuth = requireAuth;
  const mockAppLogger = appLogger;
  const mockSystemLogger = systemLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/holding-assets", () => {
    it("should return holding assets successfully with authentication", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: { role: "USER" },
      };

      const mockHoldingAssets = [
        {
          id: "holding1",
          assetNumber: "HOLD001",
          type: "COMPUTER",
          description: "Holding computer",
          serialNumber: "SN123",
          purchasePrice: "1000.00",
          locationId: "loc1",
          state: "HOLDING",
          status: "PENDING",
        },
      ];

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockHoldingAssets),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        data: { assets: mockHoldingAssets },
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "GET /api/holding-assets called"
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        `Fetching holding assets for user: ${mockUser.email}`
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Fetched 1 holding assets successfully"
      );
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });

    it("should handle authentication failure", async () => {
      // Arrange
      const authError = new NextResponse("Unauthorized", { status: 401 });
      mockRequireAuth.mockResolvedValue(authError);

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBe(authError);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });

    it("should return empty assets array when no holding assets exist", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: { role: "USER" },
      };

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        data: { assets: [] },
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Fetched 0 holding assets successfully"
      );
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: { role: "USER" },
      };

      const mockError = new Error("Database connection failed");
      mockRequireAuth.mockResolvedValue(mockUser);
      mockDb.select.mockImplementation(() => {
        throw mockError;
      });

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        error: "Failed to fetch holding assets.",
      });

      expect(mockSystemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching holding assets:")
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: { role: "USER" },
      };

      const mockError = "Unknown error string";
      mockRequireAuth.mockResolvedValue(mockUser);
      mockDb.select.mockImplementation(() => {
        throw mockError;
      });

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        error: "Failed to fetch holding assets.",
      });
    });

    it("should handle multiple holding assets", async () => {
      // Arrange
      const mockUser = {
        id: "user1",
        email: "user@example.com",
        user_metadata: { role: "USER" },
      };

      const mockHoldingAssets = [
        {
          id: "holding1",
          assetNumber: "HOLD001",
          type: "COMPUTER",
          description: "Holding computer 1",
        },
        {
          id: "holding2",
          assetNumber: "HOLD002",
          type: "MONITOR",
          description: "Holding monitor 1",
        },
        {
          id: "holding3",
          assetNumber: "HOLD003",
          type: "LAPTOP",
          description: "Holding laptop 1",
        },
      ];

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockHoldingAssets),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        data: { assets: mockHoldingAssets },
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Fetched 3 holding assets successfully"
      );
    });

    it("should handle admin user authentication", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };

      const mockHoldingAssets = [
        {
          id: "holding1",
          assetNumber: "HOLD001",
          type: "COMPUTER",
          description: "Holding computer",
        },
      ];

      mockRequireAuth.mockResolvedValue(mockAdmin);
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockHoldingAssets),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        data: { assets: mockHoldingAssets },
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        `Fetching holding assets for user: ${mockAdmin.email}`
      );
    });

    it("should handle missing authentication token", async () => {
      // Arrange
      const authError = new NextResponse("Unauthorized", { status: 401 });
      mockRequireAuth.mockResolvedValue(authError);

      const request = new NextRequest(
        "http://localhost:3000/api/holding-assets"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBe(authError);
      expect(mockRequireAuth).toHaveBeenCalledWith(request);
    });
  });
});
