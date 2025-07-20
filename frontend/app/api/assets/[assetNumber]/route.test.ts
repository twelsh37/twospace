// frontend/app/api/assets/[assetNumber]/route.test.ts
import { NextResponse } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/db";
import { appLogger } from "@/lib/logger";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        leftJoin: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve([])),
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
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
  },
  usersTable: {
    id: "id",
    name: "name",
    email: "email",
  },
  locationsTable: {
    id: "id",
    name: "name",
  },
  assetHistoryTable: {
    id: "id",
    assetId: "assetId",
    previousState: "previousState",
    newState: "newState",
    changedBy: "changedBy",
    timestamp: "timestamp",
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

describe("Single Asset API Route", () => {
  const mockDb = db;
  const mockAppLogger = appLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/assets/[assetNumber]", () => {
    it("should return asset details successfully", async () => {
      // Arrange
      const mockAsset = {
        id: "asset1",
        assetNumber: "ASSET001",
        type: "LAPTOP",
        description: "Test Laptop",
        state: "READY_TO_GO",
        locationName: "MAIN OFFICE",
        serialNumber: "SN123",
        createdAt: new Date(),
      };

      // Mock the first select for asset details
      const mockAssetSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAsset]),
          }),
        }),
      });

      // Mock the second select for history
      const mockHistorySelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      mockDb.select
        .mockImplementationOnce(() => mockAssetSelect())
        .mockImplementation(() => mockHistorySelect());

      const request = new Request("http://localhost:3000/api/assets/ASSET001");
      const params = Promise.resolve({ assetNumber: "ASSET001" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: {
          ...mockAsset,
          updatedByName: "System",
          isArchived: false,
        },
      });
    });

    it("should return error for missing asset number", async () => {
      // Arrange
      const request = new Request("http://localhost:3000/api/assets/");
      const params = Promise.resolve({ assetNumber: "" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        error: "Asset number is required",
      });

      expect(mockAppLogger.warn).toHaveBeenCalledWith(
        "Asset number is required in GET /api/assets/[assetNumber]"
      );
    });

    it("should return 404 when asset not found in active table", async () => {
      // Arrange
      // Mock empty result from active assets table
      const mockEmptyAssetSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Mock empty result from archived assets table
      const mockEmptyArchivedSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      mockDb.select
        .mockImplementationOnce(() => mockEmptyAssetSelect())
        .mockImplementation(() => mockEmptyArchivedSelect());

      const request = new Request(
        "http://localhost:3000/api/assets/NONEXISTENT"
      );
      const params = Promise.resolve({ assetNumber: "NONEXISTENT" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toEqual({
        error: "Asset not found",
      });
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      mockDb.select.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new Request("http://localhost:3000/api/assets/ASSET001");
      const params = Promise.resolve({ assetNumber: "ASSET001" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch asset details",
        details: "Database connection failed",
      });
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockDb.select.mockImplementation(() => {
        throw "Unknown error";
      });

      const request = new Request("http://localhost:3000/api/assets/ASSET001");
      const params = Promise.resolve({ assetNumber: "ASSET001" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch asset details",
        details: "Unknown error",
      });
    });

    it("should handle asset with null location", async () => {
      // Arrange
      const mockAsset = {
        id: "asset1",
        assetNumber: "ASSET001",
        type: "LAPTOP",
        description: "Test Laptop",
        state: "READY_TO_GO",
        locationName: null,
        serialNumber: "SN123",
        createdAt: new Date(),
      };

      // Mock the first select for asset details
      const mockAssetSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAsset]),
          }),
        }),
      });

      // Mock the second select for history
      const mockHistorySelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      mockDb.select
        .mockImplementationOnce(() => mockAssetSelect())
        .mockImplementation(() => mockHistorySelect());

      const request = new Request("http://localhost:3000/api/assets/ASSET001");
      const params = Promise.resolve({ assetNumber: "ASSET001" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: {
          ...mockAsset,
          updatedByName: "System",
          isArchived: false,
        },
      });
    });

    it("should handle special characters in asset number", async () => {
      // Arrange
      const mockAsset = {
        id: "asset1",
        assetNumber: "ASSET-001#",
        type: "LAPTOP",
        description: "Test Laptop",
        state: "READY_TO_GO",
        locationName: "MAIN OFFICE",
        serialNumber: "SN123",
        createdAt: new Date(),
      };

      // Mock the first select for asset details
      const mockAssetSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAsset]),
          }),
        }),
      });

      // Mock the second select for history
      const mockHistorySelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      mockDb.select
        .mockImplementationOnce(() => mockAssetSelect())
        .mockImplementation(() => mockHistorySelect());

      const request = new Request(
        "http://localhost:3000/api/assets/ASSET-001%23"
      );
      const params = Promise.resolve({ assetNumber: "ASSET-001#" });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: {
          ...mockAsset,
          updatedByName: "System",
          isArchived: false,
        },
      });
    });
  });
});
