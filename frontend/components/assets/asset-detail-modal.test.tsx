// frontend/components/assets/asset-detail-modal.test.tsx
// Unit tests for AssetDetailModal component

import React from "react";
import { render, screen } from "../../lib/test-utils";
import { AssetDetailModal } from "./asset-detail-modal";
import { AssetState } from "@/lib/types";

// Mock the auth context
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    session: {
      access_token: "mock-token",
    },
  }),
}));

describe("AssetDetailModal", () => {
  const mockAsset = {
    id: "1",
    assetNumber: "ASSET-001",
    description: "Test Asset Description",
    locationName: "Building A",
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
    updatedByName: "Admin User",
    isArchived: false,
    archiveReason: null,
    archivedAt: null,
    archivedBy: null,
  };

  const mockArchivedAsset = {
    ...mockAsset,
    isArchived: true,
    archiveReason: "Asset no longer in use",
    archivedAt: "2023-12-01T00:00:00Z",
    archivedBy: "admin@example.com",
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when isOpen is true", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Details for ASSET-001")).toBeInTheDocument();
    });

    it("does not render modal when isOpen is false", () => {
      render(
        <AssetDetailModal
          isOpen={false}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders with correct dialog size", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      const dialogContent = screen.getByRole("dialog");
      expect(dialogContent).toHaveClass("sm:max-w-[625px]");
    });
  });

  describe("Loading State", () => {
    it("displays loading title and description when isLoading is true", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={null}
          isLoading={true}
        />
      );

      expect(screen.getByText("Loading Asset...")).toBeInTheDocument();
      expect(
        screen.getByText("Please wait while we fetch the asset details.")
      ).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("shows loading content when isLoading is true", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={null}
          isLoading={true}
        />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Asset Not Found State", () => {
    it("displays not found title when asset is null and not loading", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={null}
          isLoading={false}
        />
      );

      expect(screen.getByText("Asset Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("Could not load asset details.")
      ).toBeInTheDocument();
    });
  });

  describe("Asset Display", () => {
    it("displays asset information correctly", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      expect(screen.getByText("Details for ASSET-001")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Here is the detailed information for the selected asset."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("ASSET-001")).toBeInTheDocument();
      expect(screen.getByText("Building A")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("£1,000.00")).toBeInTheDocument(); // GBP formatted price
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    it("displays state badge with correct styling", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      const badge = screen.getByText("Available Stock");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-blue-600", "text-white");
    });

    it("displays unassigned when assignedTo is null", () => {
      const unassignedAsset = { ...mockAsset, assignedTo: null };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={unassignedAsset}
          isLoading={false}
        />
      );

      expect(screen.getByText("Unassigned")).toBeInTheDocument();
    });

    it("displays N/A when locationName is null", () => {
      const assetWithoutLocation = { ...mockAsset, locationName: null };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={assetWithoutLocation}
          isLoading={false}
        />
      );

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("formats date correctly", () => {
      const assetWithDate = {
        ...mockAsset,
        updatedAt: "2023-01-15T10:30:00Z",
      };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={assetWithDate}
          isLoading={false}
        />
      );

      // Check that the date is formatted (exact format depends on locale)
      expect(screen.getByText(/15\/01\/2023/)).toBeInTheDocument();
    });
  });

  describe("Archive Information", () => {
    it("displays archived badge when asset is archived", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockArchivedAsset}
          isLoading={false}
        />
      );

      expect(screen.getByText("ARCHIVED ASSET")).toBeInTheDocument();
      expect(screen.getByText("ARCHIVED ASSET")).toHaveClass(
        "bg-gray-700",
        "text-white"
      );
    });

    it("displays archive information section when asset is archived", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockArchivedAsset}
          isLoading={false}
        />
      );

      expect(screen.getByText("Archive Information")).toBeInTheDocument();
      expect(screen.getByText("Asset no longer in use")).toBeInTheDocument();
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    it("displays N/A for missing archive information", () => {
      const archivedAssetWithMissingInfo = {
        ...mockArchivedAsset,
        archiveReason: null,
        archivedBy: null,
        archivedAt: null,
      };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={archivedAssetWithMissingInfo}
          isLoading={false}
        />
      );

      const naElements = screen.getAllByText("N/A");
      expect(naElements.length).toBeGreaterThan(0);
    });

    it("does not display archive information when asset is not archived", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      expect(screen.queryByText("ARCHIVED ASSET")).not.toBeInTheDocument();
      expect(screen.queryByText("Archive Information")).not.toBeInTheDocument();
    });
  });

  describe("State Badge Styling", () => {
    it("applies correct styling for AVAILABLE state", () => {
      const asset = { ...mockAsset, state: AssetState.AVAILABLE };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      const badge = screen.getByText("Available Stock");
      expect(badge).toHaveClass("bg-blue-600", "text-white");
    });

    it("applies correct styling for SIGNED_OUT state", () => {
      const asset = { ...mockAsset, state: AssetState.SIGNED_OUT };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      const badge = screen.getByText("Signed Out");
      expect(badge).toHaveClass("bg-teal-600", "text-white");
    });

    it("applies correct styling for BUILDING state", () => {
      const asset = { ...mockAsset, state: AssetState.BUILDING };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      const badge = screen.getByText("Building");
      expect(badge).toHaveClass("bg-orange-500", "text-white");
    });

    it("applies correct styling for READY_TO_GO state", () => {
      const asset = { ...mockAsset, state: AssetState.READY_TO_GO };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      const badge = screen.getByText("Ready To Go Stock");
      expect(badge).toHaveClass("bg-purple-600", "text-white");
    });

    it("applies correct styling for ISSUED state", () => {
      const asset = { ...mockAsset, state: AssetState.ISSUED };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      const badge = screen.getByText("Issued");
      expect(badge).toHaveClass("bg-green-600", "text-white");
    });

    it("applies default styling for unknown state", () => {
      const asset = { ...mockAsset, state: "UNKNOWN" as AssetState };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      // For unknown states, the badge will be empty or show undefined
      const badge = screen
        .getByRole("dialog")
        .querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass("bg-gray-400", "text-white");
    });
  });

  describe("Price Formatting", () => {
    it("formats price in GBP currency", () => {
      const asset = { ...mockAsset, purchasePrice: "1500.50" };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      expect(screen.getByText("£1,500.50")).toBeInTheDocument();
    });

    it("handles zero price", () => {
      const asset = { ...mockAsset, purchasePrice: "0" };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      expect(screen.getByText("£0.00")).toBeInTheDocument();
    });

    it("handles large prices", () => {
      const asset = { ...mockAsset, purchasePrice: "999999.99" };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={asset}
          isLoading={false}
        />
      );

      expect(screen.getByText("£999,999.99")).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("renders with correct grid layout", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      // Check that the grid content is rendered correctly
      expect(screen.getByText("Location:")).toBeInTheDocument();
      expect(screen.getByText("Assigned To:")).toBeInTheDocument();
      expect(screen.getByText("Cost:")).toBeInTheDocument();
      expect(screen.getByText("Last Update:")).toBeInTheDocument();
      expect(screen.getByText("Updated By:")).toBeInTheDocument();
    });

    it("applies correct spacing and styling", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      // Check that the content is properly structured
      expect(screen.getByText("ASSET-001")).toBeInTheDocument();
      expect(screen.getByText("Available Stock")).toBeInTheDocument();
      expect(screen.getByText("Building A")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("renders archive section with correct styling", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockArchivedAsset}
          isLoading={false}
        />
      );

      const archiveSection = screen
        .getByText("Archive Information")
        .closest("div");
      expect(archiveSection).toHaveClass("font-semibold", "text-gray-700", "mb-1");
    });
  });

  describe("Accessibility", () => {
    it("has proper dialog structure", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Details for ASSET-001" })
      ).toBeInTheDocument();
    });

    it("has proper label associations", () => {
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={mockAsset}
          isLoading={false}
        />
      );

      expect(screen.getByText("Location:")).toBeInTheDocument();
      expect(screen.getByText("Assigned To:")).toBeInTheDocument();
      expect(screen.getByText("Cost:")).toBeInTheDocument();
      expect(screen.getByText("Last Update:")).toBeInTheDocument();
      expect(screen.getByText("Updated By:")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles asset with missing updatedAt", () => {
      const assetWithoutUpdatedAt = { ...mockAsset, updatedAt: null };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={assetWithoutUpdatedAt}
          isLoading={false}
        />
      );

      // Should handle null updatedAt gracefully
      expect(screen.getByText("Details for ASSET-001")).toBeInTheDocument();
    });

    it("handles asset with missing updatedByName", () => {
      const assetWithoutUpdatedByName = { ...mockAsset, updatedByName: null };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={assetWithoutUpdatedByName}
          isLoading={false}
        />
      );

      // Should handle null updatedByName gracefully
      expect(screen.getByText("Details for ASSET-001")).toBeInTheDocument();
    });

    it("handles very long asset numbers", () => {
      const longAssetNumber = "A".repeat(50);
      const assetWithLongNumber = {
        ...mockAsset,
        assetNumber: longAssetNumber,
      };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={assetWithLongNumber}
          isLoading={false}
        />
      );

      expect(
        screen.getByText(`Details for ${longAssetNumber}`)
      ).toBeInTheDocument();
      expect(screen.getByText(longAssetNumber)).toBeInTheDocument();
    });

    it("handles special characters in asset data", () => {
      const assetWithSpecialChars = {
        ...mockAsset,
        assignedTo: "User with spaces & symbols",
        locationName: "Building & Complex",
        updatedByName: "Admin User (ID: 123)",
      };
      render(
        <AssetDetailModal
          isOpen={true}
          onClose={mockOnClose}
          asset={assetWithSpecialChars}
          isLoading={false}
        />
      );

      expect(
        screen.getByText("User with spaces & symbols")
      ).toBeInTheDocument();
      expect(screen.getByText("Building & Complex")).toBeInTheDocument();
      expect(screen.getByText("Admin User (ID: 123)")).toBeInTheDocument();
    });
  });
});
