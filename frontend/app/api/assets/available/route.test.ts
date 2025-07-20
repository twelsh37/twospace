// frontend/app/api/assets/available/route.test.ts
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase-auth-helpers";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        leftJoin: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
  },
  assetsTable: {
    id: "id",
    assetNumber: "assetNumber",
    type: "type",
    description: "description",
    serialNumber: "serialNumber",
    purchasePrice: "purchasePrice",
    locationId: "locationId",
    assignedTo: "assignedTo",
    state: "state",
    status: "status",
    createdAt: "createdAt",
    deletedAt: "deletedAt",
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
  requireAdmin: jest.fn(),
}));

describe("Available Assets API Route", () => {
  const mockDb = db;
  const mockRequireAdmin = requireAdmin;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/assets/available", () => {
    it("should return available assets successfully with admin authentication", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      const mockAssets = [
        {
          id: "asset1",
          assetNumber: "ASSET001",
          type: "LAPTOP",
          description: "Test Laptop",
          state: "READY_TO_GO",
          location: "MAIN OFFICE",
          serialNumber: "SN123",
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockAssets),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        assets: mockAssets.map((asset) => ({
          ...asset,
          createdAt: expect.any(Date),
        })),
        assetsByType: {
          LAPTOP: [
            {
              id: "asset1",
              assetNumber: "ASSET001",
              type: "LAPTOP",
              description: "Test Laptop",
              state: "READY_TO_GO",
              location: "MAIN OFFICE",
              serialNumber: "SN123",
              createdAt: expect.any(Date),
            },
          ],
        },
        totalCount: 1,
      });
    });

    it("should handle admin authentication failure", async () => {
      // Arrange
      mockRequireAdmin.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authorized" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Unauthorized",
      });
      expect(mockRequireAdmin).toHaveBeenCalledWith(request);
    });

    it("should return empty assets array when no available assets exist", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        assets: [],
        assetsByType: {},
        totalCount: 0,
      });
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      mockDb.select.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch available assets",
        details: "Database connection failed",
      });
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      mockDb.select.mockImplementation(() => {
        throw "Unknown error";
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch available assets",
        details: "Unknown error",
      });
    });

    it("should handle multiple available assets by type", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      const mockAssets = [
        {
          id: "asset1",
          assetNumber: "LAPTOP001",
          type: "LAPTOP",
          description: "Laptop 1",
          state: "READY_TO_GO",
          location: "OFFICE A",
          serialNumber: "SN1",
          createdAt: new Date(),
        },
        {
          id: "asset2",
          assetNumber: "LAPTOP002",
          type: "LAPTOP",
          description: "Laptop 2",
          state: "READY_TO_GO",
          location: "OFFICE B",
          serialNumber: "SN2",
          createdAt: new Date(),
        },
        {
          id: "asset3",
          assetNumber: "MONITOR001",
          type: "MONITOR",
          description: "Monitor 1",
          state: "READY_TO_GO",
          location: "OFFICE A",
          serialNumber: "SN3",
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockAssets),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.assets).toHaveLength(3);
      expect(data.assetsByType).toHaveProperty("LAPTOP");
      expect(data.assetsByType).toHaveProperty("MONITOR");
      expect(data.assetsByType.LAPTOP).toHaveLength(2);
      expect(data.assetsByType.MONITOR).toHaveLength(1);
      expect(data.totalCount).toBe(3);
    });

    it("should handle assets with null location", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      const mockAssets = [
        {
          id: "asset1",
          assetNumber: "ASSET001",
          type: "LAPTOP",
          description: "Test Laptop",
          state: "READY_TO_GO",
          location: null,
          serialNumber: "SN123",
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockAssets),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.assetsByType.LAPTOP[0].location).toBe("Unknown");
    });

    it("should handle missing authentication token", async () => {
      // Arrange
      mockRequireAdmin.mockResolvedValue({
        data: { user: null },
        error: { message: "No auth token" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
    });

    it("should include CORS headers in response", async () => {
      // Arrange
      const mockAdmin = {
        id: "admin1",
        email: "admin@example.com",
        user_metadata: { role: "ADMIN" },
      };
      mockRequireAdmin.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      });

      const mockAssets = [
        {
          id: "asset1",
          assetNumber: "ASSET001",
          type: "LAPTOP",
          description: "Test Laptop",
          state: "READY_TO_GO",
          location: "MAIN OFFICE",
          serialNumber: "SN123",
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockAssets),
            }),
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/assets/available"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      // Check for CORS headers
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
        "Content-Type, Authorization"
      );
    });
  });
});
