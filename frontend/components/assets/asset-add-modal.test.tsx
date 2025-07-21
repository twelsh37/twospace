// frontend/components/assets/asset-add-modal.test.tsx

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

// Unit tests for AssetAddModal component

import React from "react";
import { render, screen, waitFor } from "../../lib/test-utils";
import { AssetAddModal } from "./asset-add-modal";
import userEvent from "@testing-library/user-event";

// Mock the auth context
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    session: {
      access_token: "mock-token",
    },
  }),
}));

// Mock the AssetForm component
jest.mock("@/components/assets/asset-form", () => ({
  AssetForm: ({
    mode,
    onSubmit,
    onCancel,
  }: {
    mode: string;
    onSubmit: (data: unknown) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="asset-form">
      <div data-testid="form-mode">{mode}</div>
      <button
        data-testid="submit-button"
        onClick={() =>
          onSubmit({
            assetNumber: "TEST-001",
            description: "Test Asset",
            location: "Building A",
            department: "IT",
            state: "ACTIVE",
            purchaseDate: "2023-01-01",
            purchasePrice: 1000,
            currentValue: 800,
            serialNumber: "SN001",
            manufacturer: "Test Manufacturer",
            model: "Test Model",
          })
        }
      >
        Submit
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("AssetAddModal", () => {
  const user = userEvent.setup();
  const mockOnOpenChange = jest.fn();
  const mockOnAdded = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onAdded: mockOnAdded,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe("Rendering", () => {
    it("renders modal when open is true", () => {
      render(<AssetAddModal {...defaultProps} />);

      expect(screen.getByText("Add New Asset")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Fill in the details to add a new asset to your inventory."
        )
      ).toBeInTheDocument();
      expect(screen.getByTestId("asset-form")).toBeInTheDocument();
    });

    it("does not render modal when open is false", () => {
      render(<AssetAddModal {...defaultProps} open={false} />);

      expect(screen.queryByText("Add New Asset")).not.toBeInTheDocument();
      expect(screen.queryByTestId("asset-form")).not.toBeInTheDocument();
    });

    it("renders AssetForm with correct props", () => {
      render(<AssetAddModal {...defaultProps} />);

      expect(screen.getByTestId("asset-form")).toBeInTheDocument();
      expect(screen.getByTestId("form-mode")).toHaveTextContent("create");
    });

    it("renders dialog with correct classes", () => {
      render(<AssetAddModal {...defaultProps} />);

      const dialogContent = screen.getByRole("dialog");
      expect(dialogContent).toBeInTheDocument();
      expect(dialogContent).toHaveClass("max-w-2xl");
    });
  });

  describe("Form Submission", () => {
    it("submits form successfully and closes modal", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
          body: JSON.stringify({
            assetNumber: "TEST-001",
            description: "Test Asset",
            location: "Building A",
            department: "IT",
            state: "ACTIVE",
            purchaseDate: "2023-01-01",
            purchasePrice: 1000,
            currentValue: 800,
            serialNumber: "SN001",
            manufacturer: "Test Manufacturer",
            model: "Test Model",
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnAdded).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("calls onAdded callback when form submission is successful", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdded).toHaveBeenCalled();
      });
    });

    it("does not call onAdded when prop is not provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<AssetAddModal {...defaultProps} onAdded={undefined} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdded).not.toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when API returns error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Asset number already exists" }),
      });

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Asset number already exists")
        ).toBeInTheDocument();
      });

      // Modal should not close on error
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    it("displays generic error message when API response is not JSON", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to add asset. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("displays error message when network request fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("displays generic error message for unknown errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue("Unknown error");

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to add asset. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("clears error when modal opens", async () => {
      // First, create an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Test error" }),
      });

      const { rerender } = render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Test error")).toBeInTheDocument();
      });

      // Close and reopen modal
      rerender(<AssetAddModal {...defaultProps} open={false} />);
      rerender(<AssetAddModal {...defaultProps} open={true} />);

      // Error should be cleared
      expect(screen.queryByText("Test error")).not.toBeInTheDocument();
    });
  });

  describe("Modal Interactions", () => {
    it("calls onOpenChange when cancel button is clicked", async () => {
      render(<AssetAddModal {...defaultProps} />);

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Authorization", () => {
    it("includes Authorization header when session token is available", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
          body: expect.any(String),
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", () => {
      render(<AssetAddModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Add New Asset" })
      ).toBeInTheDocument();
    });

    it("has proper dialog description", () => {
      render(<AssetAddModal {...defaultProps} />);

      expect(
        screen.getByText(
          "Fill in the details to add a new asset to your inventory."
        )
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles malformed API response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ details: "Validation failed" }),
      });

      render(<AssetAddModal {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Validation failed")).toBeInTheDocument();
      });
    });
  });
});
