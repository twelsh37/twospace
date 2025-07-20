// frontend/components/assets/asset-detail.test.tsx
// Unit tests for AssetDetail component

import React from "react";
import { render, screen } from "../../lib/test-utils";
import { AssetDetail } from "./asset-detail";
import { AssetState } from "@/lib/types";

// Mock the auth context
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    session: {
      access_token: "mock-token",
    },
  }),
}));

describe("AssetDetail", () => {
  const mockAsset = {
    id: "1",
    assetNumber: "ASSET-001",
    description: "Test Asset Description",
    location: "Building A",
    department: "IT",
    state: AssetState.AVAILABLE,
    type: "COMPUTER",
    purchaseDate: "2023-01-01",
    purchasePrice: "1000.00",
    currentValue: "800.00",
    assignedTo: "John Doe",
    employeeId: "EMP001",
    assignmentType: "PERMANENT",
    notes: "Test notes",
    serialNumber: "SN001",
    manufacturer: "Test Manufacturer",
    model: "Test Model",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockUnassignedAsset = {
    ...mockAsset,
    assignedTo: null,
    employeeId: null,
    department: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders asset information correctly", () => {
      render(<AssetDetail asset={mockAsset} />);

      // Check main title
      expect(screen.getByText("Asset Information")).toBeInTheDocument();

      // Check asset details
      expect(screen.getByText("ASSET-001")).toBeInTheDocument();
      expect(screen.getByText("Test Asset Description")).toBeInTheDocument();
      expect(screen.getByText("Building A")).toBeInTheDocument();
      expect(screen.getByText("IT")).toBeInTheDocument();
      expect(screen.getByText("SN001")).toBeInTheDocument();
      expect(screen.getByText("£1,000.00")).toBeInTheDocument(); // Formatted price
      expect(screen.getByText("PERMANENT")).toBeInTheDocument();
    });

    it("renders state badge with correct styling", () => {
      render(<AssetDetail asset={mockAsset} />);

      const badge = screen.getByText("Available Stock");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-blue-600", "text-white");
    });

    it("renders assigned user information when asset is assigned", () => {
      render(<AssetDetail asset={mockAsset} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("EMP001")).toBeInTheDocument();
      expect(screen.getByText("IT")).toBeInTheDocument();
    });

    it("does not render assigned user information when asset is not assigned", () => {
      render(<AssetDetail asset={mockUnassignedAsset} />);

      expect(screen.queryByText("Assigned To")).not.toBeInTheDocument();
      expect(screen.queryByText("Employee ID")).not.toBeInTheDocument();
      expect(screen.queryByText("Department")).not.toBeInTheDocument();
    });

    it("renders all field labels", () => {
      render(<AssetDetail asset={mockAsset} />);

      expect(screen.getByText("Asset Number")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Serial Number")).toBeInTheDocument();
      expect(screen.getByText("Purchase Price")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Location")).toBeInTheDocument();
      expect(screen.getByText("Assignment Type")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Last Updated")).toBeInTheDocument();
    });
  });

  describe("State Badge Styling", () => {
    it("applies correct styling for AVAILABLE state", () => {
      const asset = { ...mockAsset, state: AssetState.AVAILABLE };
      render(<AssetDetail asset={asset} />);

      const badge = screen.getByText("Available Stock");
      expect(badge).toHaveClass("bg-blue-600", "text-white");
    });

    it("applies correct styling for SIGNED_OUT state", () => {
      const asset = { ...mockAsset, state: AssetState.SIGNED_OUT };
      render(<AssetDetail asset={asset} />);

      const badge = screen.getByText("Signed Out");
      expect(badge).toHaveClass("bg-teal-600", "text-white");
    });

    it("applies correct styling for BUILDING state", () => {
      const asset = { ...mockAsset, state: AssetState.BUILDING };
      render(<AssetDetail asset={asset} />);

      const badge = screen.getByText("Building");
      expect(badge).toHaveClass("bg-orange-500", "text-white");
    });

    it("applies correct styling for READY_TO_GO state", () => {
      const asset = { ...mockAsset, state: AssetState.READY_TO_GO };
      render(<AssetDetail asset={asset} />);

      const badge = screen.getByText("Ready To Go Stock");
      expect(badge).toHaveClass("bg-purple-600", "text-white");
    });

    it("applies correct styling for ISSUED state", () => {
      const asset = { ...mockAsset, state: AssetState.ISSUED };
      render(<AssetDetail asset={asset} />);

      const badge = screen.getByText("Issued");
      expect(badge).toHaveClass("bg-green-600", "text-white");
    });

    it("applies default styling for unknown state", () => {
      const asset = { ...mockAsset, state: "UNKNOWN" as AssetState };
      render(<AssetDetail asset={asset} />);

      // For unknown states, the badge will be empty or show undefined
      const badge = screen.getByText("Asset Information").closest("div")?.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass("bg-gray-400", "text-white");
    });
  });

  describe("Date Formatting", () => {
    it("formats valid date strings correctly", () => {
      const asset = {
        ...mockAsset,
        createdAt: "2023-01-15T10:30:00Z",
        updatedAt: "2023-02-20T14:45:00Z",
      };
      render(<AssetDetail asset={asset} />);

      // Check that dates are formatted (the exact format depends on the formatDate function)
      expect(screen.getByText(/15 January 2023/)).toBeInTheDocument();
      expect(screen.getByText(/20 February 2023/)).toBeInTheDocument();
    });

    it("handles null dates gracefully", () => {
      const asset = {
        ...mockAsset,
        createdAt: null,
        updatedAt: null,
      };
      render(<AssetDetail asset={asset} />);

      expect(screen.getAllByText("N/A")).toHaveLength(2);
    });

    it("handles undefined dates gracefully", () => {
      const asset = {
        ...mockAsset,
        createdAt: undefined,
        updatedAt: undefined,
      };
      render(<AssetDetail asset={asset} />);

      expect(screen.getAllByText("N/A")).toHaveLength(2);
    });

    it("handles invalid date strings gracefully", () => {
      const asset = {
        ...mockAsset,
        createdAt: "invalid-date",
        updatedAt: "not-a-date",
      };
      render(<AssetDetail asset={asset} />);

      expect(screen.getAllByText("N/A")).toHaveLength(2);
    });

    it("handles Date objects correctly", () => {
      const asset = {
        ...mockAsset,
        createdAt: new Date("2023-01-15T10:30:00Z"),
        updatedAt: new Date("2023-02-20T14:45:00Z"),
      };
      render(<AssetDetail asset={asset} />);

      // Check that dates are formatted
      expect(screen.getByText(/15 January 2023/)).toBeInTheDocument();
      expect(screen.getByText(/20 February 2023/)).toBeInTheDocument();
    });
  });

  describe("Price Formatting", () => {
    it("formats purchase price correctly", () => {
      const asset = { ...mockAsset, purchasePrice: "1500.50" };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("£1,500.50")).toBeInTheDocument();
    });

    it("handles zero price", () => {
      const asset = { ...mockAsset, purchasePrice: "0" };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("£0.00")).toBeInTheDocument();
    });

    it("handles large prices", () => {
      const asset = { ...mockAsset, purchasePrice: "999999.99" };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("£999,999.99")).toBeInTheDocument();
    });
  });

  describe("Location Handling", () => {
    it("displays location when available", () => {
      const asset = { ...mockAsset, location: "Building B" };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("Building B")).toBeInTheDocument();
    });

    it("displays N/A when location is null", () => {
      const asset = { ...mockAsset, location: null };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("displays N/A when location is undefined", () => {
      const asset = { ...mockAsset, location: undefined };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("displays N/A when location is empty string", () => {
      const asset = { ...mockAsset, location: "" };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("renders with correct card structure", () => {
      const { container } = render(<AssetDetail asset={mockAsset} />);

      // Check for card structure
      expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
      expect(screen.getByText("Asset Information")).toBeInTheDocument();
    });

    it("applies grid layout classes", () => {
      const { container } = render(<AssetDetail asset={mockAsset} />);

      const gridContainer = container.querySelector('[class*="grid-cols-1"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it("applies monospace font to asset number and serial number", () => {
      render(<AssetDetail asset={mockAsset} />);

      const assetNumber = screen.getByText("ASSET-001");
      const serialNumber = screen.getByText("SN001");

      expect(assetNumber).toHaveClass("font-mono");
      expect(serialNumber).toHaveClass("font-mono");
    });

    it("applies correct spacing between sections", () => {
      const { container } = render(<AssetDetail asset={mockAsset} />);

      const cardContent = container.querySelector('[class*="space-y-4"]');
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      render(<AssetDetail asset={mockAsset} />);

      expect(screen.getByText("Asset Information")).toBeInTheDocument();
    });

    it("has proper label associations", () => {
      render(<AssetDetail asset={mockAsset} />);

      // Check that labels are present and associated with their values
      expect(screen.getByText("Asset Number")).toBeInTheDocument();
      expect(screen.getByText("ASSET-001")).toBeInTheDocument();
    });

    it("renders badge with proper semantic meaning", () => {
      render(<AssetDetail asset={mockAsset} />);

      const badge = screen.getByText("Available Stock");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN"); // Badge should be a span element
    });
  });

  describe("Edge Cases", () => {
    it("handles asset with minimal required fields", () => {
      const minimalAsset = {
        id: "1",
        assetNumber: "MIN-001",
        description: "Minimal Asset",
        location: "Building A",
        department: "IT",
        state: AssetState.AVAILABLE,
        type: "COMPUTER",
        purchaseDate: "2023-01-01",
        purchasePrice: "100.00",
        currentValue: "80.00",
        assignedTo: null,
        employeeId: null,
        assignmentType: "PERMANENT",
        notes: "",
        serialNumber: "",
        manufacturer: "",
        model: "",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      };

      render(<AssetDetail asset={minimalAsset} />);

      expect(screen.getByText("MIN-001")).toBeInTheDocument();
      expect(screen.getByText("Minimal Asset")).toBeInTheDocument();
      expect(screen.getByText("£100.00")).toBeInTheDocument();
    });

    it("handles very long asset descriptions", () => {
      const longDescription = "A".repeat(1000);
      const asset = { ...mockAsset, description: longDescription };
      render(<AssetDetail asset={asset} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("handles special characters in asset data", () => {
      const asset = {
        ...mockAsset,
        description: "Asset with special chars: !@#$%^&*()",
        assignedTo: "User with spaces",
        location: "Building & Complex",
      };
      render(<AssetDetail asset={asset} />);

      expect(
        screen.getByText("Asset with special chars: !@#$%^&*()")
      ).toBeInTheDocument();
      expect(screen.getByText("User with spaces")).toBeInTheDocument();
      expect(screen.getByText("Building & Complex")).toBeInTheDocument();
    });
  });
});
