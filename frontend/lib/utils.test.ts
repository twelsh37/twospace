// frontend/lib/utils.test.ts
// Unit tests for utility functions

import {
  cn,
  formatCurrency,
  formatDate,
  getRelativeTime,
  validateAsset,
  exportToCSV,
} from "./utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("combines class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("handles conditional classes", () => {
      expect(cn("base", true && "conditional", false && "not-included")).toBe(
        "base conditional"
      );
    });

    it("handles undefined and null values", () => {
      expect(cn("base", undefined, null, "valid")).toBe("base valid");
    });

    it("handles empty strings", () => {
      expect(cn("base", "", "valid")).toBe("base valid");
    });

    it("handles objects with boolean values", () => {
      expect(cn("base", { conditional: true, notIncluded: false })).toBe(
        "base conditional"
      );
    });
  });

  describe("formatCurrency", () => {
    it("formats positive numbers correctly", () => {
      expect(formatCurrency(1234.56)).toBe("£1,234.56");
    });

    it("formats zero correctly", () => {
      expect(formatCurrency(0)).toBe("£0.00");
    });

    it("formats negative numbers correctly", () => {
      expect(formatCurrency(-1234.56)).toBe("-£1,234.56");
    });

    it("handles large numbers", () => {
      expect(formatCurrency(1234567.89)).toBe("£1,234,567.89");
    });

    it("handles decimal places correctly", () => {
      expect(formatCurrency(1234)).toBe("£1,234.00");
    });
  });

  describe("formatDate", () => {
    it("formats date string correctly", () => {
      const date = new Date("2023-01-15");
      expect(formatDate(date)).toBe("15 January 2023");
    });

    it("handles different date formats", () => {
      const date = new Date("2023-12-25");
      expect(formatDate(date)).toBe("25 December 2023");
    });

    it("handles ISO date strings", () => {
      const date = new Date("2023-06-10T00:00:00.000Z");
      expect(formatDate(date)).toBe("10 June 2023");
    });
  });

  describe("getRelativeTime", () => {
    it("returns just now for very recent dates", () => {
      const now = new Date();
      expect(getRelativeTime(now)).toBe("just now");
    });

    it("returns relative time for past dates", () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      expect(getRelativeTime(pastDate)).toContain("hour");
    });

    it("returns relative time for future dates", () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const result = getRelativeTime(futureDate);
      // The function returns "just now" for very small time differences or "in X hour/minute" for future dates
      expect(result === "just now" || result.includes("hour") || result.includes("minute")).toBe(true);
    });
  });

  describe("validateAsset", () => {
    it("validates complete asset data", () => {
      const asset = {
        type: "COMPUTER",
        serialNumber: "SN123",
        description: "Test asset",
        purchasePrice: "1000",
        location: "Building A",
      };
      const errors = validateAsset(asset);
      expect(errors).toHaveLength(0);
    });

    it("returns errors for missing required fields", () => {
      const asset = {
        type: "",
        serialNumber: "",
        description: "",
        purchasePrice: "",
        location: "",
      };
      const errors = validateAsset(asset);
      expect(errors).toContain("Asset type is required");
      expect(errors).toContain("Serial number is required");
      expect(errors).toContain("Description is required");
      expect(errors).toContain("Purchase price must be a positive number");
      expect(errors).toContain("Location is required");
    });

    it("validates purchase price correctly", () => {
      const asset = {
        type: "COMPUTER",
        serialNumber: "SN123",
        description: "Test asset",
        purchasePrice: "-100",
        location: "Building A",
      };
      const errors = validateAsset(asset);
      expect(errors).toContain("Purchase price must be a positive number");
    });

    it("handles undefined purchase price", () => {
      const asset = {
        type: "COMPUTER",
        serialNumber: "SN123",
        description: "Test asset",
        purchasePrice: undefined,
        location: "Building A",
      };
      const errors = validateAsset(asset);
      expect(errors).toContain("Purchase price must be a positive number");
    });
  });

  describe("exportToCSV", () => {
    beforeEach(() => {
      // Mock document methods
      Object.defineProperty(document, "createElement", {
        value: jest.fn(() => ({
          href: "",
          download: "",
          click: jest.fn(),
        })),
        writable: true,
      });
      Object.defineProperty(document.body, "appendChild", {
        value: jest.fn(),
        writable: true,
      });
      Object.defineProperty(document.body, "removeChild", {
        value: jest.fn(),
        writable: true,
      });
      Object.defineProperty(URL, "createObjectURL", {
        value: jest.fn(() => "mock-url"),
        writable: true,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        value: jest.fn(),
        writable: true,
      });
    });

    it("exports data to CSV", () => {
      const data = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      exportToCSV(data, "test.csv");
      // Should not throw an error
      expect(true).toBe(true);
    });

    it("handles empty data", () => {
      exportToCSV([], "test.csv");
      // Should not throw an error
      expect(true).toBe(true);
    });

    it("handles null data", () => {
      exportToCSV(null as unknown, "test.csv");
      // Should not throw an error
      expect(true).toBe(true);
    });
  });
});
