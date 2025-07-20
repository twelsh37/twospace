// frontend/app/api/settings/route.test.ts
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
