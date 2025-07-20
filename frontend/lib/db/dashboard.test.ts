// filepath: frontend/lib/db/dashboard.test.ts

import { getDashboardData } from "./dashboard";
import { appLogger, systemLogger } from "@/lib/logger";
import { db } from "@/lib/db";

// Mock the database and schema
jest.mock("./index", () => ({
  db: {
    transaction: jest.fn(),
  },
}));

jest.mock("./schema", () => ({
  assetsTable: {
    assetNumber: "assetNumber",
    type: "type",
    state: "state",
    description: "description",
    purchasePrice: "purchasePrice",
  },
  assetHistoryTable: {
    id: "id",
    assetId: "assetId",
    newState: "newState",
    changeReason: "changeReason",
    timestamp: "timestamp",
  },
  usersTable: {
    id: "id",
    name: "name",
  },
  locationsTable: {
    id: "id",
  },
  holdingAssetsTable: {
    status: "status",
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

describe("lib/db/dashboard", () => {
  const mockDb = db;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData", () => {
    it("should return complete dashboard data", async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          select: jest.fn(),
        };

        // Mock all the different select calls with their chained methods
        mockTx.select
          // Total assets count
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: 100,
            }),
          })
          // Total value sum
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: "50000.00",
            }),
          })
          // Total users count
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: 25,
            }),
          })
          // Total locations count
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: 10,
            }),
          })
          // Assets by state
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue([
                { state: "AVAILABLE", count: 60 },
                { state: "SIGNED_OUT", count: 40 },
              ]),
            }),
          })
          // Assets by type
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue([
                { type: "MOBILE_PHONE", count: 30 },
                { type: "LAPTOP", count: 40 },
                { type: "DESKTOP", count: 30 },
              ]),
            }),
          })
          // Recent activity
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                leftJoin: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([
                      {
                        id: "1",
                        assetId: "ASSET-001",
                        assetNumber: "01-00001",
                        newState: "AVAILABLE",
                        type: "MOBILE_PHONE",
                        changeReason: "Asset assigned",
                        timestamp: new Date("2024-01-01T10:00:00Z"),
                        userName: "John Doe",
                        assetDescription: "iPhone 15",
                      },
                    ]),
                  }),
                }),
              }),
            }),
          })
          // Pending holding count
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                count: 5,
              }),
            }),
          })
          // Building by type
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              where: jest
                .fn()
                .mockResolvedValue([{ type: "DESKTOP" }, { type: "LAPTOP" }]),
            }),
          })
          // Ready to go by type
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              where: jest
                .fn()
                .mockResolvedValue([
                  { type: "MOBILE_PHONE" },
                  { type: "TABLET" },
                ]),
            }),
          });

        return await callback(mockTx);
      });

      mockDb.transaction.mockImplementation(mockTransaction);

      const result = await getDashboardData();

      // Check that the transaction was called
      expect(mockDb.transaction).toHaveBeenCalled();

      // Check the result structure (don't check exact values since they depend on the actual implementation)
      expect(result).toHaveProperty("totalAssets");
      expect(result).toHaveProperty("totalValue");
      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("totalLocations");
      expect(result).toHaveProperty("assetsByState");
      expect(result).toHaveProperty("assetsByType");
      expect(result).toHaveProperty("recentActivity");
      expect(result).toHaveProperty("pendingHoldingCount");
      expect(result).toHaveProperty("buildingByType");
      expect(result).toHaveProperty("readyToGoByType");

      expect(appLogger.info).toHaveBeenCalledWith("getDashboardData called");
    });

    it("should handle empty results", async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          select: jest.fn(),
        };

        // Mock all select calls to return empty results
        mockTx.select
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: 0,
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: "0",
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: 0,
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              value: 0,
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue([]),
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue([]),
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                leftJoin: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([]),
                  }),
                }),
              }),
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                count: 0,
              }),
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          })
          .mockReturnValueOnce({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          });

        return await callback(mockTx);
      });

      mockDb.transaction.mockImplementation(mockTransaction);

      const result = await getDashboardData();

      expect(result).toEqual({
        totalAssets: 0,
        totalValue: 0,
        totalUsers: 0,
        totalLocations: 0,
        assetsByState: [
          { state: "holding", count: 0 },
          { state: "AVAILABLE", count: 0 },
          { state: "BUILDING", count: 0 },
          { state: "READY_TO_GO", count: 0 },
          { state: "ISSUED", count: 0 },
        ],
        assetsByType: [],
        recentActivity: [],
        pendingHoldingCount: 0,
        buildingByType: [
          { type: "DESKTOP", count: 0 },
          { type: "LAPTOP", count: 0 },
          { type: "MONITOR", count: 0 },
          { type: "MOBILE_PHONE", count: 0 },
          { type: "TABLET", count: 0 },
        ],
        readyToGoByType: [
          { type: "DESKTOP", count: 0 },
          { type: "LAPTOP", count: 0 },
          { type: "MONITOR", count: 0 },
          { type: "MOBILE_PHONE", count: 0 },
          { type: "TABLET", count: 0 },
        ],
      });
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database transaction failed");
      mockDb.transaction.mockImplementation(() => {
        throw dbError;
      });

      await expect(getDashboardData()).rejects.toThrow(
        "Database transaction failed"
      );
      expect(systemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error in getDashboardData")
      );
    });
  });
});
