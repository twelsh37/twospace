// frontend/components/assets/asset-filters.test.tsx

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

// Unit tests for AssetFilters component

import React from "react";
import { render, screen, fireEvent } from "../../lib/test-utils";
import { AssetFilters, FilterState } from "./asset-filters";
import { AssetType, AssetState } from "@/lib/types";

// Mock the Select components to avoid floating UI issues in tests
jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => (
    <div data-testid={`select-item-${value}`} onClick={() => {}}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
}));

describe("AssetFilters", () => {
  const mockFilters: FilterState = {
    type: "ALL",
    state: "ALL",
    status: "ALL",
  };

  const mockOnFilterChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all filter selectors", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getAllByTestId("select")).toHaveLength(3);
      expect(screen.getAllByText("All Types")).toHaveLength(2); // Trigger and content
      expect(screen.getAllByText("All States")).toHaveLength(2); // Trigger and content
      expect(screen.getAllByText("All Statuses")).toHaveLength(2); // Trigger and content
    });

    it("renders clear filters button", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders with correct layout structure", () => {
      const { container } = render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      // Check for grid layout
      const gridContainer = container.querySelector('[class*="grid-cols-1"]');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe("Filter Interactions", () => {
    it("displays current filter values", () => {
      const filtersWithValues: FilterState = {
        type: AssetType.LAPTOP,
        state: AssetState.AVAILABLE,
        status: "ACTIVE",
      };

      render(
        <AssetFilters
          filters={filtersWithValues}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const selects = screen.getAllByTestId("select");
      expect(selects[0]).toHaveAttribute("data-value", AssetType.LAPTOP);
      expect(selects[1]).toHaveAttribute("data-value", AssetState.AVAILABLE);
      expect(selects[2]).toHaveAttribute("data-value", "ACTIVE");
    });

    it("renders select components with correct structure", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const selects = screen.getAllByTestId("select");
      expect(selects).toHaveLength(3);

      // Check that all selects have the correct data attributes
      selects.forEach((select) => {
        expect(select).toHaveAttribute("data-value");
      });
    });

    it("calls onClearFilters when clear button is clicked", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText("Clear Filters");
      fireEvent.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe("Filter Options", () => {
    it("renders all asset type options", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getAllByText("All Types")).toHaveLength(2); // Trigger and content
      expect(screen.getByText("Mobile Phone")).toBeInTheDocument();
      expect(screen.getByText("Tablet")).toBeInTheDocument();
      expect(screen.getByText("Desktop")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Monitor")).toBeInTheDocument();
    });

    it("renders all asset state options with badges", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getAllByText("All States")).toHaveLength(2); // Trigger and content
      expect(screen.getByText("Available Stock")).toBeInTheDocument();
      expect(screen.getByText("Signed Out")).toBeInTheDocument();
      expect(screen.getByText("Building")).toBeInTheDocument();
      expect(screen.getByText("Ready To Go Stock")).toBeInTheDocument();
      expect(screen.getByText("Issued")).toBeInTheDocument();
    });

    it("renders all status options", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getAllByText("All Statuses")).toHaveLength(2); // Trigger and content
      expect(screen.getByText("Holding")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Stock")).toBeInTheDocument();
      expect(screen.getByText("Recycled")).toBeInTheDocument();
      expect(screen.getByText("Repair")).toBeInTheDocument();
    });
  });

  describe("State Badge Styling", () => {
    it("applies correct styling for AVAILABLE state badge", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const availableBadge = screen
        .getByText("Available Stock")
        .closest('[data-slot="badge"]');
      expect(availableBadge).toHaveClass("bg-blue-600", "text-white");
    });

    it("applies correct styling for SIGNED_OUT state badge", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const signedOutBadge = screen
        .getByText("Signed Out")
        .closest('[data-slot="badge"]');
      expect(signedOutBadge).toHaveClass("bg-teal-600", "text-white");
    });

    it("applies correct styling for BUILDING state badge", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const buildingBadge = screen
        .getByText("Building")
        .closest('[data-slot="badge"]');
      expect(buildingBadge).toHaveClass("bg-orange-500", "text-white");
    });

    it("applies correct styling for READY_TO_GO state badge", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const readyToGoBadge = screen
        .getByText("Ready To Go Stock")
        .closest('[data-slot="badge"]');
      expect(readyToGoBadge).toHaveClass("bg-purple-600", "text-white");
    });

    it("applies correct styling for ISSUED state badge", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const issuedBadge = screen
        .getByText("Issued")
        .closest('[data-slot="badge"]');
      expect(issuedBadge).toHaveClass("bg-green-600", "text-white");
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive grid classes", () => {
      const { container } = render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const gridContainer = container.querySelector('[class*="grid-cols-1"]');
      expect(gridContainer).toHaveClass("sm:grid-cols-2", "lg:grid-cols-4");
    });

    it("applies responsive button classes", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText("Clear Filters").closest("button");
      expect(clearButton).toHaveClass("w-full", "sm:w-auto");
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
    });

    it("has proper placeholder text", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getAllByText("All Types")).toHaveLength(2); // Trigger and content
      expect(screen.getAllByText("All States")).toHaveLength(2); // Trigger and content
      expect(screen.getAllByText("All Statuses")).toHaveLength(2); // Trigger and content
    });
  });

  describe("Edge Cases", () => {
    it("handles empty filter values", () => {
      const emptyFilters: FilterState = {
        type: "ALL",
        state: "ALL",
        status: "ALL",
      };

      render(
        <AssetFilters
          filters={emptyFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getAllByText("All Types")).toHaveLength(2); // Trigger and content
      expect(screen.getAllByText("All States")).toHaveLength(2); // Trigger and content
      expect(screen.getAllByText("All Statuses")).toHaveLength(2); // Trigger and content
    });

    it("handles null filter values gracefully", () => {
      const nullFilters = {
        type: null as unknown as AssetType | "ALL",
        state: null as unknown as AssetState | "ALL",
        status: null as unknown as string | "ALL",
      };

      render(
        <AssetFilters
          filters={nullFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      // Should still render without errors
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    it("handles undefined filter values gracefully", () => {
      const undefinedFilters = {
        type: undefined as unknown as AssetType | "ALL",
        state: undefined as unknown as AssetState | "ALL",
        status: undefined as unknown as string | "ALL",
      };

      render(
        <AssetFilters
          filters={undefinedFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      // Should still render without errors
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("renders with correct spacing", () => {
      const { container } = render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const mainContainer = container.querySelector('[class*="space-y-4"]');
      expect(mainContainer).toBeInTheDocument();
    });

    it("renders clear button with icon", () => {
      render(
        <AssetFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText("Clear Filters");
      expect(clearButton).toBeInTheDocument();
      // The X icon should be present (though we can't easily test the SVG)
      expect(clearButton.closest("button")).toHaveClass("w-full", "sm:w-auto");
    });
  });
});
