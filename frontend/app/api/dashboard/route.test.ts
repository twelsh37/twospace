// frontend/app/api/dashboard/route.test.ts
// Tests for dashboard API route

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
import { getDashboardData } from "@/lib/db/dashboard";
import { appLogger, systemLogger } from "@/lib/logger";

// Mock dependencies
jest.mock("@/lib/db/dashboard", () => ({
  getDashboardData: jest.fn(),
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

describe("Dashboard API Route", () => {
  const mockGetDashboardData = getDashboardData;
  const mockAppLogger = appLogger;
  const mockSystemLogger = systemLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/dashboard", () => {
    it("should return dashboard data successfully", async () => {
      // Arrange
      const mockDashboardData = {
        totalAssets: 100,
        availableAssets: 50,
        assignedAssets: 30,
        buildingAssets: 20,
        recentActivity: [],
        assetsByType: {},
        assetsByState: {},
      };

      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockDashboardData,
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "TEST LOG: /api/dashboard GET handler invoked"
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "GET /api/dashboard called"
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Dashboard data fetched successfully"
      );
      expect(mockGetDashboardData).toHaveBeenCalledTimes(1);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockError = new Error("Database connection failed");
      mockGetDashboardData.mockRejectedValue(mockError);

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch dashboard data",
        details: "Database connection failed",
      });

      expect(mockSystemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching dashboard data:")
      );
    });

    it("should handle unknown errors", async () => {
      // Arrange
      const mockError = "Unknown error string";
      mockGetDashboardData.mockRejectedValue(mockError);

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: "Failed to fetch dashboard data",
        details: "Unknown error",
      });
    });

    it("should log test message for verification", async () => {
      // Arrange
      mockGetDashboardData.mockResolvedValue({});

      // Act
      await GET();

      // Assert
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "TEST LOG: /api/dashboard GET handler invoked"
      );
    });
  });
});
