// frontend/app/api/departments/route.test.ts
// Tests for departments API route

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
        orderBy: jest.fn(() => Promise.resolve([])),
      })),
    })),
  },
  departmentsTable: {
    id: "id",
    name: "name",
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

describe("Departments API Route", () => {
  const mockDb = db;
  const mockAppLogger = appLogger;
  const mockSystemLogger = systemLogger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/departments", () => {
    it("should return departments successfully", async () => {
      // Arrange
      const mockDepartments = [
        { id: "dept1", name: "Information Technology" },
        { id: "dept2", name: "Human Resources" },
        { id: "dept3", name: "Finance" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockDepartments),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        departments: [
          { id: "dept1", name: "INFORMATION TECHNOLOGY" },
          { id: "dept2", name: "HUMAN RESOURCES" },
          { id: "dept3", name: "FINANCE" },
        ],
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "GET /api/departments called"
      );
      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Fetched 3 unique departments"
      );
    });

    it("should deduplicate departments by name", async () => {
      // Arrange
      const mockDepartments = [
        { id: "dept1", name: "Information Technology" },
        { id: "dept2", name: "information technology" }, // Duplicate with different case
        { id: "dept3", name: "Human Resources" },
        { id: "dept4", name: "HUMAN RESOURCES" }, // Duplicate with different case
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockDepartments),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      const data = await response.json();
      expect(data.departments).toHaveLength(2); // Should deduplicate to 2 unique departments
      expect(data.departments).toEqual([
        { id: "dept1", name: "INFORMATION TECHNOLOGY" },
        { id: "dept3", name: "HUMAN RESOURCES" },
      ]);
    });

    it("should handle empty departments list", async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        departments: [],
      });

      expect(mockAppLogger.info).toHaveBeenCalledWith(
        "Fetched 0 unique departments"
      );
    });

    it("should handle departments with null names", async () => {
      // Arrange
      const mockDepartments = [
        { id: "dept1", name: "Information Technology" },
        { id: "dept2", name: null }, // Should be filtered out
        { id: "dept3", name: "Human Resources" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockDepartments),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      const data = await response.json();
      expect(data.departments).toHaveLength(2); // Should filter out null names
      expect(data.departments).toEqual([
        { id: "dept1", name: "INFORMATION TECHNOLOGY" },
        { id: "dept3", name: "HUMAN RESOURCES" },
      ]);
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
        error: "Failed to fetch departments",
      });

      expect(mockSystemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching departments:")
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
        error: "Failed to fetch departments",
      });
    });

    it("should convert all department names to uppercase", async () => {
      // Arrange
      const mockDepartments = [
        { id: "dept1", name: "information technology" },
        { id: "dept2", name: "Human Resources" },
        { id: "dept3", name: "FINANCE" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockDepartments),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      const data = await response.json();
      expect(data.departments).toEqual([
        { id: "dept1", name: "INFORMATION TECHNOLOGY" },
        { id: "dept2", name: "HUMAN RESOURCES" },
        { id: "dept3", name: "FINANCE" },
      ]);
    });

    it("should maintain alphabetical order after deduplication", async () => {
      // Arrange
      const mockDepartments = [
        { id: "dept3", name: "Finance" },
        { id: "dept1", name: "Information Technology" },
        { id: "dept2", name: "Human Resources" },
        { id: "dept4", name: "finance" }, // Duplicate
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockDepartments),
        }),
      });

      // Act
      const response = await GET();

      // Assert
      const data = await response.json();
      expect(data.departments).toEqual([
        { id: "dept3", name: "FINANCE" },
        { id: "dept1", name: "INFORMATION TECHNOLOGY" },
        { id: "dept2", name: "HUMAN RESOURCES" },
      ]);
    });
  });
});
