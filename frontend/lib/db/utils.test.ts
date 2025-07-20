// filepath: frontend/lib/db/utils.test.ts

import {
  generateAssetNumber,
  getActiveAssets,
  getAssetStatistics,
} from "./utils";
import { appLogger, systemLogger } from "@/lib/logger";

// Mock the database and schema
jest.mock("./index", () => ({
  db: {
    update: jest.fn(),
    insert: jest.fn(),
    select: jest.fn(),
  },
}));

jest.mock("./schema", () => ({
  assetsTable: {
    assetNumber: "assetNumber",
    type: "type",
    state: "state",
    locationId: "locationId",
    deletedAt: "deletedAt",
    description: "description",
    serialNumber: "serialNumber",
    assignedTo: "assignedTo",
    purchasePrice: "purchasePrice",
  },
  assetSequencesTable: {
    nextSequence: "nextSequence",
    assetType: "assetType",
  },
  assetHistoryTable: {
    id: "id",
    assetId: "assetId",
    newState: "newState",
    changedBy: "changedBy",
    changeReason: "changeReason",
    previousState: "previousState",
    details: "details",
    timestamp: "timestamp",
  },
}));

jest.mock("@/lib/logger", () => ({
  systemLogger: {
    error: jest.fn(),
  },
  appLogger: {
    info: jest.fn(),
  },
}));

describe("lib/db/utils", () => {
  const mockDb = db;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAssetNumber", () => {
    it("should generate asset number for MOBILE_PHONE type", async () => {
      const mockResult = [{ nextSequence: 1001 }];
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });

      // Import the function dynamically to avoid module loading issues
      
      const result = await generateAssetNumber("MOBILE_PHONE");

      expect(result).toBe("01-01000");
      expect(mockDb.update).toHaveBeenCalledWith(assetSequencesTable);
      expect(appLogger.info).toHaveBeenCalledWith(
        "generateAssetNumber called",
        {
          assetType: "MOBILE_PHONE",
        }
      );
    });

    it("should generate asset number for LAPTOP type", async () => {
      const mockResult = [{ nextSequence: 5001 }];
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });

      
      const result = await generateAssetNumber("LAPTOP");

      expect(result).toBe("04-05000");
    });

    it("should throw error when sequence not found", async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      
      await expect(generateAssetNumber("MOBILE_PHONE")).rejects.toThrow(
        "Failed to generate asset number"
      );
      expect(systemLogger.error).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database connection failed");
      mockDb.update.mockImplementation(() => {
        throw dbError;
      });

      
      await expect(generateAssetNumber("MOBILE_PHONE")).rejects.toThrow(
        "Failed to generate asset number"
      );
      expect(systemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error generating asset number")
      );
    });
  });

  describe("getActiveAssets", () => {
    it("should get all active assets without filters", async () => {
      const mockAssets = [
        { id: "1", assetNumber: "01-00001", type: "MOBILE_PHONE" },
        { id: "2", assetNumber: "02-00001", type: "TABLET" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockAssets),
        }),
      });

      
      const result = await getActiveAssets();

      expect(result).toEqual(mockAssets);
      expect(appLogger.info).toHaveBeenCalledWith("getActiveAssets called", {
        filters: undefined,
      });
    });

    it("should apply type filter", async () => {
      const mockAssets = [
        { id: "1", assetNumber: "01-00001", type: "MOBILE_PHONE" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockAssets),
        }),
      });

      
      await getActiveAssets({ type: "MOBILE_PHONE" });

      expect(appLogger.info).toHaveBeenCalledWith("getActiveAssets called", {
        filters: { type: "MOBILE_PHONE" },
      });
    });

    it("should apply state filter", async () => {
      const mockAssets = [
        { id: "1", assetNumber: "01-00001", state: "AVAILABLE" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockAssets),
        }),
      });

      
      await getActiveAssets({ state: "AVAILABLE" });

      expect(appLogger.info).toHaveBeenCalledWith("getActiveAssets called", {
        filters: { state: "AVAILABLE" },
      });
    });

    it("should apply location filter", async () => {
      const mockAssets = [
        { id: "1", assetNumber: "01-00001", locationId: "loc-123" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockAssets),
        }),
      });

      
      await getActiveAssets({ locationId: "loc-123" });

      expect(appLogger.info).toHaveBeenCalledWith("getActiveAssets called", {
        filters: { locationId: "loc-123" },
      });
    });

    it("should apply search filter", async () => {
      const mockAssets = [
        { id: "1", assetNumber: "01-00001", description: "iPhone" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockAssets),
        }),
      });

      
      await getActiveAssets({ search: "iPhone" });

      expect(appLogger.info).toHaveBeenCalledWith("getActiveAssets called", {
        filters: { search: "iPhone" },
      });
    });

    it("should apply pagination", async () => {
      const mockAssets = [{ id: "1", assetNumber: "01-00001" }];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue(mockAssets),
            }),
          }),
        }),
      });

      
      await getActiveAssets({ limit: 10, offset: 20 });

      expect(appLogger.info).toHaveBeenCalledWith("getActiveAssets called", {
        filters: { limit: 10, offset: 20 },
      });
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Query failed");
      mockDb.select.mockImplementation(() => {
        throw dbError;
      });

      
      await expect(getActiveAssets()).rejects.toThrow(
        "Failed to retrieve assets"
      );
      expect(systemLogger.error).toHaveBeenCalled();
    });
  });

  describe("getAssetStatistics", () => {
    it("should return asset statistics", async () => {
      const mockTotalAssets = [{ count: 100 }];
      const mockAssetsByType = [
        { type: "MOBILE_PHONE", count: 30 },
        { type: "LAPTOP", count: 40 },
        { type: "DESKTOP", count: 30 },
      ];
      const mockAssetsByState = [
        { state: "AVAILABLE", count: 60 },
        { state: "SIGNED_OUT", count: 40 },
      ];

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockTotalAssets),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue(mockAssetsByType),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue(mockAssetsByState),
            }),
          }),
        });

      
      const result = await getAssetStatistics();

      expect(result).toEqual({
        totalAssets: 100,
        assetsByType: {
          MOBILE_PHONE: 30,
          LAPTOP: 40,
          DESKTOP: 30,
        },
        assetsByState: {
          AVAILABLE: 60,
          SIGNED_OUT: 40,
        },
      });
      expect(appLogger.info).toHaveBeenCalledWith("getAssetStatistics called");
    });

    it("should handle empty results", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      
      const result = await getAssetStatistics();

      expect(result).toEqual({
        totalAssets: 0,
        assetsByType: {},
        assetsByState: {},
      });
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Query failed");
      mockDb.select.mockImplementation(() => {
        throw dbError;
      });

      
      await expect(getAssetStatistics()).rejects.toThrow(
        "Failed to get asset statistics"
      );
      expect(systemLogger.error).toHaveBeenCalled();
    });
  });
});
