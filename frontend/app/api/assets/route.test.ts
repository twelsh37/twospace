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
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.leftJoin.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockRejectedValueOnce(new Error("DB error"));
      const req = createRequest("http://localhost/api/assets", "GET");
      const res = await GET(req);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });

  describe("POST", () => {
    it("creates a new asset and returns it", async () => {
      // Mock location validation chain
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.select.mockResolvedValueOnce([{ id: 1, name: "HQ" }]); // location exists
      // Mock asset creation chain
      mockDb.insert.mockReturnThis();
      mockDb.values.mockReturnThis();
      mockDb.returning.mockResolvedValueOnce([
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
      expect(json.data.assetNumber).toBe("ASSET-001");
      expect(json.data.location).toBe("HQ");
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
      // Mock the Drizzle chain for PUT
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockReturnThis();
      // The handler expects [{ asset: {...}, location: {...} }]
      mockDb.returning.mockResolvedValueOnce([
        {
          asset: {
            id: 1,
            assetNumber: "ASSET-001",
            state: "inactive",
            deletedAt: null,
            status: "inactive",
          },
          location: { name: "HQ" },
        },
      ]);
      const req = createRequest("http://localhost/api/assets", "PUT", {
        id: 1,
        state: "inactive",
      });
      const res = await PUT(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.state).toBe("inactive");
      expect(json.data.location).toBe("HQ");
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
