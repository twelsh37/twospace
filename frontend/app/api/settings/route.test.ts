// frontend/app/api/settings/route.test.ts
// Tests for settings API route

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
import { appLogger, systemLogger } from "@/lib/logger";
// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([])),
      })),
    })),
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

describe("Settings API Route", () => {
  const mockDb = db;
  const mockAppLogger = appLogger;
  const mockSystemLogger = systemLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/settings", () => {
    it("should return settings successfully", async () => {
      // Arrange
      const mockSettings = [
        {
          reportCacheDuration: 30,
          depreciationSettings: {
            method: "straight_line",
            years: 5,
          },
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSettings),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        reportCacheDuration: 30,
        depreciationSettings: {
          method: "straight_line",
          years: 5,
        },
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "GET /api/settings called"
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Fetched settings successfully"
      );
    });

    it("should return 404 when no settings found", async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toEqual({
        error: "Settings not found",
      });

      expect(mockAppLogger.warn).toHaveBeenCalledWith(
        "Settings not found in GET /api/settings"
      );
    });

    it("should handle null depreciationSettings", async () => {
      // Arrange
      const mockSettings = [
        {
          reportCacheDuration: 30,
          depreciationSettings: null,
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSettings),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        reportCacheDuration: 30,
        depreciationSettings: null,
      });
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockError = new Error("Database connection failed");
      mockDb.select.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        error: "Failed to fetch settings",
      });

      expect(mockSystemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching settings:")
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const mockError = "Unknown error string";
      mockDb.select.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        error: "Failed to fetch settings",
      });
    });

    it("should always include depreciationSettings in response", async () => {
      // Arrange
      const mockSettings = [
        {
          reportCacheDuration: 45,
          depreciationSettings: {
            method: "declining_balance",
            years: 3,
            rate: 0.2,
          },
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSettings),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      const data = await response.json();
      expect(data).toHaveProperty("depreciationSettings");
      expect(data.depreciationSettings).toEqual({
        method: "declining_balance",
        years: 3,
        rate: 0.2,
      });
    });
  });
});
