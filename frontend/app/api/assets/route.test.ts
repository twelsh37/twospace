// frontend/app/api/assets/route.test.ts
// Unit tests for the /api/assets API route handlers

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      headers: options?.headers || {},
    })),
  },
}));

// Mock the database and utility functions
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    leftJoin: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
    insert: jest.fn(),
    values: jest.fn(),
    returning: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
  },
  assetsTable: {},
  locationsTable: {},
}));
// Mock generateAssetNumber and createAssetHistory
jest.mock("@/lib/db/utils", () => ({
  generateAssetNumber: jest.fn(() => Promise.resolve("ASSET-001")),
  createAssetHistory: jest.fn(() => Promise.resolve()),
}));

// Now import the route handlers (after all mocks)
import { GET, POST, PUT, assetCache } from "./route";
import { NextRequest } from "next/server";

// Get the mocked db
const { db: mockDb } = require("@/lib/db");

// Utility to create a mock NextRequest
function createRequest(url: string, method: string, body?: any) {
  return {
    url,
    method,
    json: async () => body,
    headers: { get: () => undefined },
    nextUrl: { searchParams: new URL(url).searchParams },
  } as unknown as NextRequest;
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset all mockDb methods
  Object.values(mockDb).forEach((fn) => {
    if (typeof fn === "function") fn.mockReset();
  });
  // Clear cache
  if (assetCache) {
    Object.keys(assetCache).forEach((k) => delete assetCache[k]);
  }
});

describe("/api/assets route", () => {
  describe("GET", () => {
    it("returns assets with default filters", async () => {
      // Mock the full Drizzle chain for GET
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockResolvedValueOnce([
        {
          asset: {
            id: 1,
            assetNumber: "ASSET-001",
            type: "laptop",
            state: "active",
            locationId: 1,
            serialNumber: "SN123",
            description: "A test laptop",
            purchasePrice: 1000,
            deletedAt: null,
            status: "active",
          },
          location: { name: "HQ" },
        },
      ]);
      // Also mock totalCountQuery
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.select.mockResolvedValueOnce([{ count: 1 }]);
      const req = createRequest("http://localhost/api/assets", "GET");
      const res = await GET(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.assets)).toBe(true);
      expect(json.data.assets[0].assetNumber).toBe("ASSET-001");
      expect(json.data.assets[0].location).toBe("HQ");
    });

    it("returns cached data if available", async () => {
      // The cache expects the same structure as the handler's response
      assetCache["default"] = {
        data: {
          success: true,
          data: {
            assets: [{ assetNumber: "ASSET-001", location: "HQ" }],
            pagination: {},
          },
        },
        timestamp: Date.now(),
        duration: 10000,
      };
      const req = createRequest("http://localhost/api/assets", "GET");
      const res = await GET(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.assets.length).toBe(1);
      expect(json.data.assets[0].assetNumber).toBe("ASSET-001");
      expect(json.data.assets[0].location).toBe("HQ");
    });

    it("handles errors gracefully", async () => {
      // Explicit chainable mock for assets query (throws on offset)
      const assetsChain = {
        from() {
          return this;
        },
        leftJoin() {
          return this;
        },
        where() {
          return this;
        },
        orderBy() {
          return this;
        },
        limit() {
          return this;
        },
        offset() {
          throw new Error("DB error");
        },
      };
      // Explicit chainable mock for count query (returns [{ count: 1 }])
      const countChain = {
        from() {
          return this;
        },
        where() {
          return this;
        },
        limit() {
          return this;
        },
        offset() {
          return this;
        },
        select: () => Promise.resolve([{ count: 1 }]), // hardcoded as number
      };
      mockDb.select.mockImplementation((arg) => {
        console.log("mockDb.select called with:", arg);
        if (arg === undefined) {
          // This is the count query
          return {
            from() {
              return this;
            },
            where() {
              return this;
            },
            limit() {
              return this;
            },
            offset() {
              return this;
            },
            select: () => Promise.resolve([{ count: 1 }]),
          };
        }
        if (
          arg &&
          typeof arg === "object" &&
          "asset" in arg &&
          "location" in arg
        ) {
          // This is the assets query
          return {
            from() {
              return this;
            },
            leftJoin() {
              return this;
            },
            where() {
              return this;
            },
            orderBy() {
              return this;
            },
            limit() {
              return this;
            },
            offset() {
              throw new Error("DB error");
            },
          };
        }
        // fallback
        return {};
      });
      const req = createRequest("http://localhost/api/assets", "GET");
      const res = await GET(req);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });

  describe("POST", () => {
    it("creates a new asset and returns it", async () => {
      // Chain for location check
      const locationChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce([{ id: 1, name: "HQ" }]),
      };
      // Chain for serial number uniqueness check
      const serialChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce([]),
      };
      // Chain for asset creation
      const insertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            assetNumber: "ASSET-001",
            type: "laptop",
            state: "active",
            locationId: 1,
            serialNumber: "SN123",
            description: "A test laptop",
            purchasePrice: 1000,
            deletedAt: null,
            status: "active",
          },
        ]),
      };
      let selectCall = 0;
      mockDb.select.mockImplementation(() => {
        selectCall++;
        return selectCall === 1 ? locationChain : serialChain;
      });
      mockDb.insert.mockReturnValue(insertChain);
      const req = createRequest("http://localhost/api/assets", "POST", {
        type: "laptop",
        state: "active",
        locationId: 1,
        serialNumber: "SN123",
        description: "A test laptop",
        purchasePrice: 1000,
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.asset.assetNumber).toBe("ASSET-001");
      expect(json.data.asset.locationId).toBe(1);
    });

    it("handles validation errors", async () => {
      const req = createRequest("http://localhost/api/assets", "POST", {});
      const res = await POST(req);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });

  describe("PUT", () => {
    it("updates an asset and returns it", async () => {
      // Explicit chainable mock for asset fetch (returns asset array on select)
      const fetchChain = {
        from() {
          return this;
        },
        where() {
          return this;
        },
        select: () =>
          Promise.resolve([
            {
              id: 1,
              assetNumber: "ASSET-001",
              state: "active",
              locationId: 1,
            },
          ]),
      };
      // Chain for update
      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            assetNumber: "ASSET-001",
            state: "active",
          },
        ]),
      };
      let selectCall = 0;
      mockDb.select.mockImplementation(() => {
        selectCall++;
        return fetchChain;
      });
      mockDb.update.mockReturnValue(updateChain);
      const req = createRequest("http://localhost/api/assets", "PUT", {
        assetIds: ["ASSET-001"],
        operation: "stateTransition",
        payload: { newState: "active" },
      });
      const res = await PUT(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.updatedAssets[0].assetNumber).toBe("ASSET-001");
      expect(json.data.updatedAssets[0].state).toBe("active"); // The mock returns 'active' as the state
    });

    it("handles update errors", async () => {
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.returning.mockRejectedValueOnce(new Error("Update error"));
      const req = createRequest("http://localhost/api/assets", "PUT", {
        id: 1,
        state: "inactive",
      });
      const res = await PUT(req);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });
});
