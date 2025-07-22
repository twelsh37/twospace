// frontend/app/api/search/route.test.ts
// Tests for search API route

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

import { NextResponse } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/db";
import { appLogger } from "@/lib/logger";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([])),
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
  },
  usersTable: {
    id: "id",
    name: "name",
    email: "email",
    employeeId: "employeeId",
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
  archivedAssetsTable: {
    id: "id",
    assetNumber: "assetNumber",
    type: "type",
    description: "description",
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

describe("Search API Route", () => {
  const mockDb = db;
  const mockAppLogger = appLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/search", () => {
    it("should return search results successfully", async () => {
      // Arrange
      const mockSearchResults = {
        assets: [
          {
            id: "asset1",
            assetNumber: "COMP001",
            type: "COMPUTER",
            description: "Test computer",
          },
        ],
        users: [
          {
            id: "user1",
            name: "John Doe",
            email: "john@example.com",
          },
        ],
        locations: [
          {
            id: "loc1",
            name: "Office A",
          },
        ],
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockSearchResults.assets),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/search?q=test");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(mockAppLogger.info).toHaveBeenCalledWith("GET /api/search called");
      expect(mockAppLogger.info).toHaveBeenCalledWith("Search query received", {
        query: "test",
      });
    });

    it("should return error for missing query parameter", async () => {
      // Arrange
      const request = new Request("http://localhost:3000/api/search");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        error: "Query parameter is required and cannot be empty",
      });

      expect(mockAppLogger.warn).toHaveBeenCalledWith(
        "Query parameter is required and cannot be empty in search"
      );
    });

    it("should return error for empty query parameter", async () => {
      // Arrange
      const request = new Request("http://localhost:3000/api/search?q=");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        error: "Query parameter is required and cannot be empty",
      });
    });

    it("should return error for whitespace-only query", async () => {
      // Arrange
      const request = new Request("http://localhost:3000/api/search?q=%20%20");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        error: "Query parameter is required and cannot be empty",
      });
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      mockDb.select.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new Request("http://localhost:3000/api/search?q=test");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to perform search",
        details: "Database connection failed",
      });
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockDb.select.mockImplementation(() => {
        throw "Unknown error";
      });

      const request = new Request("http://localhost:3000/api/search?q=test");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to perform search",
        details: "Unknown error",
      });
    });

    it("should search across assets, users, and locations", async () => {
      // Arrange
      const mockAssets = [
        {
          id: "asset1",
          assetNumber: "ASSET001",
          type: "LAPTOP",
          description: "Test Laptop",
          locationName: "MAIN OFFICE",
        },
      ];
      const mockUsers = [
        {
          id: "user1",
          name: "John Doe",
          email: "john@example.com",
        },
      ];
      const mockLocations = [
        {
          id: "loc1",
          name: "MAIN OFFICE",
        },
      ];

      // Mock the Promise.all behavior for the parallel searches
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(mockAssets),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]), // Archived assets
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockUsers),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockLocations),
          }),
        });

      // Mock the additional select for asset history
      mockDb.select.mockReturnValue({
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

      const request = new Request("http://localhost:3000/api/search?q=test");

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(mockDb.select).toHaveBeenCalledTimes(5); // 4 initial + 1 for history
    });

    it("should handle special characters in query", async () => {
      // Arrange
      const request = new Request(
        "http://localhost:3000/api/search?q=test%20%26%20search"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(mockAppLogger.info).toHaveBeenCalledWith("Search query received", {
        query: "test & search",
      });
    });
  });
});
