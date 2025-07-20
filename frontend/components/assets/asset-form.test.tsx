/**
 * File: frontend/components/assets/asset-form.test.tsx
 * Description: Comprehensive tests for AssetForm component
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetForm } from "./asset-form";
import { AssetType, AssetState } from "@/lib/types";
import { ASSET_TYPE_LABELS } from "@/lib/constants";

// Mock dependencies
jest.mock("@/lib/utils", () => ({
  validateAsset: jest.fn(),
  cn: jest.fn((...inputs) => inputs.filter(Boolean).join(" ")),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { validateAsset } from "@/lib/utils";
const mockValidateAsset = validateAsset as jest.Mock;

// Reset mocks before each test
beforeEach(() => {
  mockFetch.mockClear();
  mockValidateAsset.mockClear();
});

// Sample data for testing
const mockLocations = [
  { id: "loc1", name: "Office A" },
  { id: "loc2", name: "Office B" },
  { id: "loc3", name: "Warehouse" },
];

const mockAsset = {
  type: AssetType.LAPTOP,
  state: AssetState.AVAILABLE,
  serialNumber: "SN123456",
  description: "Test Laptop",
  purchasePrice: "1200.00",
  location: "loc1",
};

describe("AssetForm", () => {
  const defaultProps = {
    mode: "create" as const,
    session: { access_token: "test-token" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateAsset.mockReturnValue([]);

    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
      });
  });

  describe("Rendering", () => {
    it("renders create mode form with all fields", async () => {
      render(<AssetForm {...defaultProps} />);

      // Wait for locations to load
      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Check all form fields are present
      expect(screen.getByText(/asset type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/asset number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/serial number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/purchase price/i)).toBeInTheDocument();
      expect(screen.getByText("Location *")).toBeInTheDocument();

      // Check buttons
      expect(
        screen.getByRole("button", { name: /create asset/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("renders edit mode form with asset data", async () => {
      render(<AssetForm {...defaultProps} mode="edit" asset={mockAsset} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Check form is populated with asset data
      expect(screen.getByDisplayValue("SN123456")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1200.00")).toBeInTheDocument();

      // Check button text
      expect(
        screen.getByRole("button", { name: /update asset/i })
      ).toBeInTheDocument();
    });

    it("shows suggested asset number when available", async () => {
      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Suggested: LAPTOP-001 (can override)")
        ).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue("LAPTOP-001")).toBeInTheDocument();
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      // Mock a slow API response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ ok: true }), 100)
            )
        );

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText("Saving...")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });

    it("shows error messages when validation fails", async () => {
      const user = userEvent.setup();
      mockValidateAsset.mockReturnValue([
        "Serial number is required",
        "Description is required",
      ]);

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Submit without filling required fields
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Serial number is required")
        ).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
      });
    });

    it("shows API error messages", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: "Asset number already exists" }),
        });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Asset number already exists")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Interactions", () => {
    it("updates form fields when user types", async () => {
      const user = userEvent.setup();
      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      expect(screen.getByDisplayValue("SN123456")).toBeInTheDocument();
    });

    it("changes asset type and fetches new suggested number", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "MONITOR-001" }),
        });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Change asset type
      const typeSelect = screen.getByRole("combobox", { name: /asset type/i });
      await user.click(typeSelect);

      const monitorOption = screen.getByText(
        ASSET_TYPE_LABELS[AssetType.MONITOR]
      );
      await user.click(monitorOption);

      await waitFor(() => {
        expect(
          screen.getByText("Suggested: MONITOR-001 (can override)")
        ).toBeInTheDocument();
      });
    });

    it("allows user to override suggested asset number", async () => {
      const user = userEvent.setup();
      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const assetNumberInput = screen.getByLabelText(/asset number/i);
      await user.clear(assetNumberInput);
      await user.type(assetNumberInput, "CUSTOM-001");

      expect(screen.getByDisplayValue("CUSTOM-001")).toBeInTheDocument();
    });

    it("clears errors when user starts typing", async () => {
      const user = userEvent.setup();
      mockValidateAsset.mockReturnValueOnce(["Serial number is required"]);

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Submit to trigger errors
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Serial number is required")
        ).toBeInTheDocument();
      });

      // Start typing to clear errors
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      await waitFor(() => {
        expect(
          screen.queryByText("Serial number is required")
        ).not.toBeInTheDocument();
      });
    });

    it("handles location selection", async () => {
      const user = userEvent.setup();
      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const locationSelect = screen.getByRole("combobox", {
        name: /location/i,
      });
      await user.click(locationSelect);

      const warehouseOption = screen.getByText("Warehouse");
      await user.click(warehouseOption);

      expect(screen.getByText("Warehouse")).toBeInTheDocument();
    });

    it("shows message when no locations are available", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "No locations available. Please add a location first."
          )
        ).toBeInTheDocument();
      });

      const locationSelect = screen.getByRole("combobox", {
        name: /location/i,
      });
      expect(locationSelect).toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    it("submits form with correct data in create mode", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(<AssetForm {...defaultProps} onSubmit={onSubmit} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            serialNumber: "SN123456",
            description: "Test Asset",
            purchasePrice: "1000",
            locationId: "loc1",
            assetNumber: "LAPTOP-001",
          })
        );
      });
    });

    it("submits form with API call when no onSubmit provided", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(
            expect.objectContaining({
              serialNumber: "SN123456",
              description: "Test Asset",
              purchasePrice: "1000",
              locationId: "loc1",
              assetNumber: "LAPTOP-001",
            })
          ),
        });
      });
    });

    it("resets form after successful creation", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      // Wait for form reset
      await waitFor(() => {
        expect(screen.getByDisplayValue("")).toBeInTheDocument(); // Serial number should be empty
      });

      expect(screen.getByDisplayValue("")).toBeInTheDocument(); // Description should be empty
      expect(screen.getByDisplayValue("")).toBeInTheDocument(); // Price should be empty
    });

    it("validates required fields before submission", async () => {
      const user = userEvent.setup();
      mockValidateAsset.mockReturnValue([]);

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Submit without filling required fields
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Asset number is required")
        ).toBeInTheDocument();
      });
    });

    it("handles network errors during submission", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockRejectedValueOnce(new Error("Network error"));

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("An error occurred while saving the asset")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Authentication", () => {
    it("includes authorization header when session has access token", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(
        <AssetForm {...defaultProps} session={{ access_token: "test-token" }} />
      );

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: expect.any(String),
        });
      });
    });

    it("submits without authorization header when no access token", async () => {
      const user = userEvent.setup();

      // Mock the locations API call
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, assetNumber: "LAPTOP-001" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<AssetForm {...defaultProps} session={null} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Fill required fields
      const serialNumberInput = screen.getByLabelText(/serial number/i);
      await user.type(serialNumberInput, "SN123456");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Test Asset");

      const priceInput = screen.getByLabelText(/purchase price/i);
      await user.type(priceInput, "1000");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.any(String),
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and form structure", async () => {
      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Check form element exists
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      // Check all form fields have proper labels
      expect(screen.getByText("Asset Type *")).toBeInTheDocument();
      expect(screen.getByLabelText(/asset number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/serial number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/purchase price/i)).toBeInTheDocument();
      expect(screen.getByText("Location *")).toBeInTheDocument();

      // Check submit button is properly associated
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("supports keyboard navigation", async () => {
      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Tab through form elements
      await userEvent.tab();
      expect(screen.getAllByRole("combobox")[0]).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText(/asset number/i)).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText(/serial number/i)).toHaveFocus();
    });

    it("has proper error announcements", async () => {
      mockValidateAsset.mockReturnValue(["Serial number is required"]);

      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      // Submit to trigger errors
      const submitButton = screen.getByRole("button", {
        name: /create asset/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorList = screen.getByRole("list");
        expect(errorList).toBeInTheDocument();
        expect(
          screen.getByText("Serial number is required")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles API failures gracefully", async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"));

      render(<AssetForm {...defaultProps} />);

      // Should not crash and should show empty locations
      await waitFor(() => {
        expect(
          screen.getByText(
            "No locations available. Please add a location first."
          )
        ).toBeInTheDocument();
      });
    });

    it("handles empty API responses", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "No locations available. Please add a location first."
          )
        ).toBeInTheDocument();
      });
    });

    it("handles rapid form changes", async () => {
      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const descriptionInput = screen.getByLabelText(/description/i);

      // Rapid typing
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, "Rapid");
      await userEvent.type(descriptionInput, "Change");
      await userEvent.type(descriptionInput, "Test");

      expect(screen.getByDisplayValue("RapidChangeTest")).toBeInTheDocument();
    });

    it("handles cancel button click", async () => {
      const onCancel = jest.fn();

      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} onCancel={onCancel} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it("handles description max length", async () => {
      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const descriptionInput = screen.getByLabelText(/description/i);
      expect(descriptionInput).toHaveAttribute("maxLength", "100");
    });

    it("handles price input validation", async () => {
      // Mock the locations API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(<AssetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Office A")).toBeInTheDocument();
      });

      const priceInput = screen.getByLabelText(/purchase price/i);
      expect(priceInput).toHaveAttribute("type", "number");
      expect(priceInput).toHaveAttribute("step", "0.01");
      expect(priceInput).toHaveAttribute("min", "0");
    });
  });
});
