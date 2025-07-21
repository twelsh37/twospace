// filepath: frontend/lib/server/exportUtils.test.ts

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

import {
  generateTableReportHTML,
  generateTableCSV,
  generateTableCSVStream,
  generatePDFViaBrowserless,
} from "./exportUtils";

// Mock fetch for PDF generation tests
global.fetch = jest.fn();

// Mock @fast-csv/format
jest.mock("@fast-csv/format", () => ({
  format: jest.fn(() => ({
    write: jest.fn(),
    end: jest.fn(),
  })),
}));

describe("exportUtils", () => {
  const mockColumns = [
    { header: "Name", key: "name" },
    { header: "Age", key: "age" },
    { header: "Email", key: "email" },
  ];

  const mockRows = [
    { name: "John Doe", age: 30, email: "john@example.com" },
    { name: "Jane Smith", age: 25, email: "jane@example.com" },
    { name: "Bob Johnson", age: 35, email: "bob@example.com" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.token;
  });

  describe("generateTableReportHTML", () => {
    it("should generate HTML with basic table structure", () => {
      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: mockRows,
      });

      // Check for essential HTML elements
      expect(html).toContain("<html>");
      expect(html).toContain("<head>");
      expect(html).toContain("<body>");
      expect(html).toContain("<table>");
      expect(html).toContain("<thead>");
      expect(html).toContain("<tbody>");

      // Check for title
      expect(html).toContain("Test Report");

      // Check for column headers
      expect(html).toContain("<th>Name</th>");
      expect(html).toContain("<th>Age</th>");
      expect(html).toContain("<th>Email</th>");

      // Check for data rows
      expect(html).toContain("John Doe");
      expect(html).toContain("Jane Smith");
      expect(html).toContain("Bob Johnson");
    });

    it("should include filters when provided", () => {
      const filters = {
        department: "Engineering",
        status: "Active",
      };

      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: mockRows,
        filters,
      });

      expect(html).toContain("Filters:");
      expect(html).toContain("department: <b>Engineering</b>");
      expect(html).toContain("status: <b>Active</b>");
    });

    it("should handle empty filters object", () => {
      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: mockRows,
        filters: {},
      });

      // Should not contain filter summary
      expect(html).not.toContain("Filters:");
    });

    it("should handle null/undefined values in rows", () => {
      const rowsWithNulls = [
        { name: "John Doe", age: null, email: undefined },
        { name: "Jane Smith", age: 25, email: "jane@example.com" },
      ];

      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: rowsWithNulls,
      });

      // Should handle null/undefined gracefully
      expect(html).toContain("<td></td>");
      expect(html).toContain("John Doe");
      expect(html).toContain("Jane Smith");
    });

    it("should apply alternating row classes", () => {
      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: mockRows,
      });

      // Check for alternating row classes
      expect(html).toContain('class="even"');
      expect(html).toContain('class="odd"');
    });

    it("should include generated timestamp", () => {
      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: mockRows,
      });

      expect(html).toContain("Generated:");
      expect(html).toContain(new Date().toLocaleString("en-GB"));
    });

    it("should handle empty rows array", () => {
      const html = generateTableReportHTML({
        title: "Test Report",
        columns: mockColumns,
        rows: [],
      });

      expect(html).toContain("<tbody></tbody>");
      expect(html).toContain("Test Report");
    });
  });

  describe("generateTableCSV", () => {
    it("should generate CSV with headers and data", () => {
      const csv = generateTableCSV({
        columns: mockColumns,
        rows: mockRows,
      });

      const lines = csv.split("\r\n");
      expect(lines).toHaveLength(4); // Header + 3 data rows

      // Check header
      expect(lines[0]).toBe("Name,Age,Email");

      // Check data rows
      expect(lines[1]).toBe("John Doe,30,john@example.com");
      expect(lines[2]).toBe("Jane Smith,25,jane@example.com");
      expect(lines[3]).toBe("Bob Johnson,35,bob@example.com");
    });

    it("should escape values containing commas", () => {
      const rowsWithCommas = [
        { name: "Doe, John", age: 30, email: "john@example.com" },
      ];

      const csv = generateTableCSV({
        columns: mockColumns,
        rows: rowsWithCommas,
      });

      expect(csv).toContain('"Doe, John"');
    });

    it("should escape values containing quotes", () => {
      const rowsWithQuotes = [
        { name: 'John "The Rock" Doe', age: 30, email: "john@example.com" },
      ];

      const csv = generateTableCSV({
        columns: mockColumns,
        rows: rowsWithQuotes,
      });

      expect(csv).toContain('"John ""The Rock"" Doe"');
    });

    it("should escape values containing newlines", () => {
      const rowsWithNewlines = [
        { name: "John Doe\nJr.", age: 30, email: "john@example.com" },
      ];

      const csv = generateTableCSV({
        columns: mockColumns,
        rows: rowsWithNewlines,
      });

      expect(csv).toContain('"John Doe\nJr."');
    });

    it("should handle null and undefined values", () => {
      const rowsWithNulls = [{ name: "John Doe", age: null, email: undefined }];

      const csv = generateTableCSV({
        columns: mockColumns,
        rows: rowsWithNulls,
      });

      expect(csv).toContain("John Doe,,");
    });

    it("should handle empty rows array", () => {
      const csv = generateTableCSV({
        columns: mockColumns,
        rows: [],
      });

      expect(csv).toBe("Name,Age,Email");
    });
  });

  describe("generateTableCSVStream", () => {
    it("should create a readable stream with CSV data", () => {
      const mockCsvStream = {
        write: jest.fn(),
        end: jest.fn(),
      };

      format.mockReturnValue(mockCsvStream);

      const stream = generateTableCSVStream({
        columns: mockColumns,
        rows: mockRows,
      });

      expect(format).toHaveBeenCalledWith({
        headers: ["name", "age", "email"],
        writeHeaders: true,
      });

      expect(mockCsvStream.write).toHaveBeenCalledTimes(3);
      expect(mockCsvStream.write).toHaveBeenCalledWith(mockRows[0]);
      expect(mockCsvStream.write).toHaveBeenCalledWith(mockRows[1]);
      expect(mockCsvStream.write).toHaveBeenCalledWith(mockRows[2]);
      expect(mockCsvStream.end).toHaveBeenCalled();

      expect(stream).toBe(mockCsvStream);
    });

    it("should handle empty rows array", () => {
      const mockCsvStream = {
        write: jest.fn(),
        end: jest.fn(),
      };

      format.mockReturnValue(mockCsvStream);

      generateTableCSVStream({
        columns: mockColumns,
        rows: [],
      });

      expect(mockCsvStream.write).not.toHaveBeenCalled();
      expect(mockCsvStream.end).toHaveBeenCalled();
    });
  });

  describe("generatePDFViaBrowserless", () => {
    const mockHtml = "<html><body>Test</body></html>";
    const mockPdfBuffer = Buffer.from("mock-pdf-content");

    beforeEach(() => {
      process.env.token = "test-token";
    });

    it("should generate PDF successfully", async () => {
      const mockResponse = {
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(mockPdfBuffer),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await generatePDFViaBrowserless(mockHtml);

      expect(fetch).toHaveBeenCalledWith(
        "https://production-sfo.browserless.io/pdf?token=test-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: mockHtml }),
        }
      );

      expect(mockResponse.arrayBuffer).toHaveBeenCalled();
      expect(result).toEqual(mockPdfBuffer);
    });

    it("should throw error when token is missing", async () => {
      delete process.env.token;

      await expect(generatePDFViaBrowserless(mockHtml)).rejects.toThrow(
        "Missing browserless.io token in environment"
      );

      expect(fetch).not.toHaveBeenCalled();
    });

    it("should throw error when browserless.io request fails", async () => {
      const mockResponse = {
        ok: false,
        text: jest.fn().mockResolvedValue("PDF generation failed"),
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(generatePDFViaBrowserless(mockHtml)).rejects.toThrow(
        "Failed to generate PDF via browserless.io: PDF generation failed"
      );
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(generatePDFViaBrowserless(mockHtml)).rejects.toThrow(
        "Network error"
      );
    });
  });
});
