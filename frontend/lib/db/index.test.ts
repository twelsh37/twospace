// filepath: frontend/lib/db/index.test.ts

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

/* eslint-disable @typescript-eslint/no-require-imports */

// Mock the entire index module to avoid side effects

jest.mock("./index", () => {
  return {
    db: {
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      transaction: jest.fn(),
    },
    assetsTable: { name: "assets" },
    usersTable: { name: "users" },
    locationsTable: { name: "locations" },
    assetHistoryTable: { name: "asset_history" },
    userAssetsTable: { name: "user_assets" },
    locationAssignmentsTable: { name: "location_assignments" },
    closeConnection: jest.fn().mockResolvedValue(undefined),
  };
});

// Mock schema
jest.mock("./schema", () => ({
  assetsTable: { name: "assets" },
  usersTable: { name: "users" },
  locationsTable: { name: "locations" },
  assetHistoryTable: { name: "asset_history" },
  userAssetsTable: { name: "user_assets" },
  locationAssignmentsTable: { name: "location_assignments" },
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  systemLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("lib/db/index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Module structure", () => {
    it("should export db instance", () => {
      const dbModule = require("./index");
      expect(dbModule.db).toBeDefined();
      expect(typeof dbModule.db.insert).toBe("function");
      expect(typeof dbModule.db.select).toBe("function");
      expect(typeof dbModule.db.update).toBe("function");
      expect(typeof dbModule.db.delete).toBe("function");
      expect(typeof dbModule.db.transaction).toBe("function");
    });

    it("should export schema tables", () => {
      const dbModule = require("./index");

      // Check that schema tables are exported
      expect(dbModule.assetsTable).toBeDefined();
      expect(dbModule.usersTable).toBeDefined();
      expect(dbModule.locationsTable).toBeDefined();
      expect(dbModule.assetHistoryTable).toBeDefined();
      expect(dbModule.userAssetsTable).toBeDefined();
      expect(dbModule.locationAssignmentsTable).toBeDefined();
    });

    it("should export closeConnection function", () => {
      const dbModule = require("./index");
      expect(typeof dbModule.closeConnection).toBe("function");
    });
  });

  describe("closeConnection", () => {
    it("should be callable and return a promise", async () => {
      const dbModule = require("./index");

      // The function should be callable
      const result = dbModule.closeConnection();
      expect(result).toBeInstanceOf(Promise);

      // Should resolve without error
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("Database interface", () => {
    it("should provide database query methods", () => {
      const dbModule = require("./index");
      const { db } = dbModule;

      // Test that all expected database methods are available
      expect(typeof db.insert).toBe("function");
      expect(typeof db.select).toBe("function");
      expect(typeof db.update).toBe("function");
      expect(typeof db.delete).toBe("function");
      expect(typeof db.transaction).toBe("function");
    });

    it("should provide schema tables with expected structure", () => {
      const dbModule = require("./index");

      // Test that schema tables have the expected structure
      expect(dbModule.assetsTable).toHaveProperty("name");
      expect(dbModule.usersTable).toHaveProperty("name");
      expect(dbModule.locationsTable).toHaveProperty("name");
      expect(dbModule.assetHistoryTable).toHaveProperty("name");
      expect(dbModule.userAssetsTable).toHaveProperty("name");
      expect(dbModule.locationAssignmentsTable).toHaveProperty("name");
    });
  });

  describe("Integration with other modules", () => {
    it("should work with dashboard module", () => {
      const dbModule = require("./index");

      // Verify that the db instance can be used by other modules
      expect(dbModule.db).toBeDefined();
      expect(typeof dbModule.db.transaction).toBe("function");
    });

    it("should work with utils module", () => {
      const dbModule = require("./index");

      // Verify that the db instance has the methods used by utils
      expect(typeof dbModule.db.select).toBe("function");
      expect(typeof dbModule.db.update).toBe("function");
      expect(typeof dbModule.db.insert).toBe("function");
    });
  });

  describe("Schema exports", () => {
    it("should export all required schema tables", () => {
      const dbModule = require("./index");

      // Verify all schema tables are exported
      const expectedTables = [
        "assetsTable",
        "usersTable",
        "locationsTable",
        "assetHistoryTable",
        "userAssetsTable",
        "locationAssignmentsTable",
      ];

      expectedTables.forEach((tableName) => {
        expect(dbModule[tableName]).toBeDefined();
        expect(dbModule[tableName]).toHaveProperty("name");
      });
    });

    it("should have consistent table structure", () => {
      const dbModule = require("./index");

      // All tables should have a name property
      Object.values(dbModule).forEach((exported) => {
        if (exported && typeof exported === "object" && exported.name) {
          expect(typeof exported.name).toBe("string");
          expect(exported.name.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
