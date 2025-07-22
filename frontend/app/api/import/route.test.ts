// frontend/app/api/import/route.test.ts
// Tests for import API route

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

import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";

// Mock external dependencies
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
  holdingAssetsTable: {
    serialNumber: "serialNumber",
  },
}));

jest.mock("@/lib/supabase-auth-helpers", () => ({
  requireAdmin: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  systemLogger: {
    error: jest.fn(),
  },
  appLogger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("csv-parse/sync", () => ({
  parse: jest.fn(),
}));

jest.mock("xlsx", () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

// Mock drizzle-orm
jest.mock("drizzle-orm", () => ({
  inArray: jest.fn(),
}));

// Helper function to create a mock NextRequest with formData
function createMockRequest(formData: FormData): NextRequest {
  const req = new NextRequest("http://localhost:3000/api/import", {
    method: "POST",
    body: formData,
  });

  // Mock the formData method to return the actual FormData
  req.formData = jest.fn().mockResolvedValue(formData);

  return req;
}

// Helper function to create a mock file with arrayBuffer method
function createMockFile(content: string): File {
  // Create a File object that will pass instanceof checks
  const file = new File([content], "test.csv", { type: "text/csv" });

  // Ensure arrayBuffer method exists and works correctly
  if (!file.arrayBuffer) {
    Object.defineProperty(file, "arrayBuffer", {
      value: async function () {
        const uint8 = new Uint8Array([...content].map((c) => c.charCodeAt(0)));
        return uint8.buffer;
      },
      writable: false,
      configurable: false,
    });
  }

  return file;
}

describe("POST /api/import", () => {
  let mockRequireAdmin: jest.MockedFunction<unknown>;
  let mockDbSelect: jest.MockedFunction<unknown>;
  let mockDbInsert: jest.MockedFunction<unknown>;
  let mockParseCSV: jest.MockedFunction<unknown>;
  let mockXLSXRead: jest.MockedFunction<unknown>;
  let mockXLSXSheetToJson: jest.MockedFunction<unknown>;
  let mockInArray: jest.MockedFunction<unknown>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Get mocked functions
    const { requireAdmin } = jest.requireMock("@/lib/supabase-auth-helpers");
    const { db } = jest.requireMock("@/lib/db");
    const { parse } = jest.requireMock("csv-parse/sync");
    const XLSX = jest.requireMock("xlsx");
    const { inArray } = jest.requireMock("drizzle-orm");

    mockRequireAdmin = requireAdmin;
    mockDbSelect = db.select;
    mockDbInsert = db.insert;
    mockParseCSV = parse;
    mockXLSXRead = XLSX.read;
    mockXLSXSheetToJson = XLSX.utils.sheet_to_json;
    mockInArray = inArray;

    // Default successful authentication
    mockRequireAdmin.mockResolvedValue({ id: "test-user-id", role: "admin" });

    // Default successful database operations
    mockDbSelect.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    mockDbInsert.mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    });

    // Default successful file parsing
    mockParseCSV.mockReturnValue([
      {
        serialNumber: "SN001",
        description: "Test Asset 1",
        supplier: "Test Supplier",
        notes: "Test notes",
      },
    ]);

    mockXLSXRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: {
        Sheet1: {},
      },
    });

    mockXLSXSheetToJson.mockReturnValue([
      {
        serialNumber: "SN001",
        description: "Test Asset 1",
        supplier: "Test Supplier",
        notes: "Test notes",
      },
    ]);

    mockInArray.mockReturnValue("inArray_condition");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockRequireAdmin.mockResolvedValue(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );

      const formData = new FormData();
      formData.append("file", createMockFile("test"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 401 when user is not admin", async () => {
      mockRequireAdmin.mockResolvedValue(
        NextResponse.json({ error: "Admin access required" }, { status: 401 })
      );

      const formData = new FormData();
      formData.append("file", createMockFile("test"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Admin access required");
    });
  });

  describe("Input Validation", () => {
    it("should return 400 when no file is provided", async () => {
      const formData = new FormData();
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("File not received or invalid.");
    });

    it("should return 400 when file is not a Blob", async () => {
      const formData = new FormData();
      formData.append("file", "not-a-blob");
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("File not received or invalid.");
    });

    it("should return 400 when type is missing", async () => {
      const formData = new FormData();
      formData.append("file", createMockFile("test"));
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing type or format.");
    });

    it("should return 400 when format is missing", async () => {
      const formData = new FormData();
      formData.append("file", createMockFile("test"));
      formData.append("type", "assets");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing type or format.");
    });

    it("should return 400 when format is not string", async () => {
      const formData = new FormData();
      formData.append("file", createMockFile("test"));
      formData.append("type", "assets");
      formData.append("format", "123");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Unsupported file format.");
    });

    it("should return 400 when unsupported format is provided", async () => {
      const formData = new FormData();
      formData.append("file", createMockFile("test"));
      formData.append("type", "assets");
      formData.append("format", "txt");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Unsupported file format.");
    });
  });

  describe("CSV Import", () => {
    it("should successfully import CSV assets", async () => {
      const csvData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
          notes: "Test notes",
        },
        {
          serialNumber: "SN002",
          description: "Test Asset 2",
          supplier: "Another Supplier",
          notes: "More notes",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      // Mock database check for existing serials
      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Import successful.");
      expect(data.data).toEqual(csvData);

      // Verify CSV parsing was called
      expect(mockParseCSV).toHaveBeenCalledWith("csv,data", {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Verify database insert was called
      expect(mockDbInsert).toHaveBeenCalled();
    });

    it("should handle CSV with BOM and whitespace in headers", async () => {
      const csvData = [
        {
          "  serialNumber  ": "SN001",
          "  description  ": "Test Asset 1",
          "  supplier  ": "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Import successful.");
    });

    it("should handle CSV with snake_case headers", async () => {
      const csvData = [
        {
          serial_number: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Import successful.");
    });

    it("should skip rows without serialNumber or description", async () => {
      const csvData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
        },
        {
          serialNumber: "",
          description: "Test Asset 2",
          supplier: "Test Supplier",
        },
        {
          serialNumber: "SN003",
          description: "",
          supplier: "Test Supplier",
        },
        {
          serialNumber: "SN004",
          description: "Test Asset 4",
          supplier: "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Import successful.");

      // Verify only valid assets were inserted
      expect(mockDbInsert).toHaveBeenCalled();
    });
  });

  describe("XLSX Import", () => {
    it("should successfully import XLSX assets", async () => {
      const xlsxData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
          notes: "Test notes",
        },
      ];

      mockXLSXRead.mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: {
          Sheet1: {},
        },
      });

      mockXLSXSheetToJson.mockReturnValue(xlsxData);

      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("xlsx,data"));
      formData.append("type", "assets");
      formData.append("format", "xlsx");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Import successful.");
      expect(data.data).toEqual(xlsxData);

      // Verify XLSX parsing was called
      expect(mockXLSXRead).toHaveBeenCalledWith(expect.any(Buffer), {
        type: "buffer",
      });
      expect(mockXLSXSheetToJson).toHaveBeenCalledWith({}, { defval: "" });
    });
  });

  describe("Duplicate Handling", () => {
    it("should skip duplicate serial numbers", async () => {
      const csvData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
        },
        {
          serialNumber: "SN002",
          description: "Test Asset 2",
          supplier: "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      // Mock database to return existing serial numbers
      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ serialNumber: "SN001" }]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe(
        "Import completed with some duplicates skipped."
      );
      expect(data.skippedSerials).toEqual(["SN001"]);
      expect(data.insertedCount).toBe(1);
    });

    it("should return 400 when all serial numbers are duplicates", async () => {
      const csvData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      // Mock database to return all serial numbers as existing
      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ serialNumber: "SN001" }]),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.warning).toBe(
        "All serial numbers in your import already exist in the holding assets table."
      );
      expect(data.skippedSerials).toEqual(["SN001"]);
    });
  });

  describe("Database Operations", () => {
    it("should handle database insert errors", async () => {
      const csvData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      // Mock database insert to throw error
      mockDbInsert.mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Import failed.");
    });

    it("should handle database select errors", async () => {
      const csvData = [
        {
          serialNumber: "SN001",
          description: "Test Asset 1",
          supplier: "Test Supplier",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      // Mock database select to throw error
      mockDbSelect.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Import failed.");
    });
  });

  describe("File Parsing Errors", () => {
    it("should handle CSV parsing errors", async () => {
      mockParseCSV.mockImplementation(() => {
        throw new Error("CSV parsing error");
      });

      const formData = new FormData();
      formData.append("file", createMockFile("invalid,csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Import failed.");
    });

    it("should handle XLSX parsing errors", async () => {
      mockXLSXRead.mockImplementation(() => {
        throw new Error("XLSX parsing error");
      });

      const formData = new FormData();
      formData.append("file", createMockFile("invalid,xlsx,data"));
      formData.append("type", "assets");
      formData.append("format", "xlsx");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Import failed.");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty CSV file", async () => {
      mockParseCSV.mockReturnValue([]);

      const formData = new FormData();
      formData.append("file", createMockFile(""));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.warning).toBe(
        "All serial numbers in your import already exist in the holding assets table."
      );
      expect(data.parsedData).toEqual([]);
    });

    it("should handle CSV with only headers", async () => {
      mockParseCSV.mockReturnValue([]);

      const formData = new FormData();
      formData.append(
        "file",
        createMockFile("serialNumber,description,supplier")
      );
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.warning).toBe(
        "All serial numbers in your import already exist in the holding assets table."
      );
      expect(data.parsedData).toEqual([]);
    });

    it("should handle non-asset import types", async () => {
      const csvData = [
        {
          name: "Test User",
          email: "test@example.com",
        },
      ];

      mockParseCSV.mockReturnValue(csvData);

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "users");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Import successful.");
      expect(data.data).toEqual(csvData);
    });
  });

  describe("Logging", () => {
    it("should log import start", async () => {
      const { appLogger } = jest.requireMock("@/lib/logger");

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      await POST(req);

      expect(appLogger.info).toHaveBeenCalledWith("POST /api/import called");
    });

    it("should log import parameters", async () => {
      const { appLogger } = jest.requireMock("@/lib/logger");

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      await POST(req);

      expect(appLogger.info).toHaveBeenCalledWith(
        "Import parameters received",
        expect.objectContaining({
          type: "assets",
          format: "csv",
          fileType: "object",
        })
      );
    });

    it("should log parsing method", async () => {
      const { appLogger } = jest.requireMock("@/lib/logger");

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      await POST(req);

      expect(appLogger.info).toHaveBeenCalledWith(
        "Parsing CSV file for import"
      );
    });

    it("should log successful import", async () => {
      const { appLogger } = jest.requireMock("@/lib/logger");

      const formData = new FormData();
      formData.append("file", createMockFile("csv,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      await POST(req);

      expect(appLogger.info).toHaveBeenCalledWith("Import successful");
    });

    it("should log errors", async () => {
      const { systemLogger } = jest.requireMock("@/lib/logger");

      mockParseCSV.mockImplementation(() => {
        throw new Error("Test error");
      });

      const formData = new FormData();
      formData.append("file", createMockFile("invalid,data"));
      formData.append("type", "assets");
      formData.append("format", "csv");

      const req = createMockRequest(formData);

      await POST(req);

      expect(systemLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Import error:")
      );
    });
  });
});
