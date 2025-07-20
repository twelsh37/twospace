/**
 * File: frontend/components/assets/asset-edit-modal.test.tsx
 * Description: Comprehensive tests for AssetEditModal component
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetEditModal } from "./asset-edit-modal";
import { useAuth } from "@/lib/auth-context";
import { ASSET_TYPE_LABELS, ASSET_STATE_LABELS } from "@/lib/constants";
import { AssetType, AssetState } from "@/lib/types";

// Mock dependencies
jest.mock("@/lib/auth-context", () => ({
  useAuth: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Sample asset data for testing
const mockAsset = {
  assetNumber: "ASSET-001",
  type: AssetType.LAPTOP,
  state: AssetState.SIGNED_OUT,
  serialNumber: "SN123456",
  description: "Test Laptop",
  purchasePrice: "1200.00",
  location: "Office A",
  department: "IT",
  assignedTo: "John Doe",
  employeeId: "EMP001",
};

describe("AssetEditModal", () => {
  const defaultProps = {
    assetNumber: "ASSET-001",
    open: true,
    onOpenChange: jest.fn(),
    onUpdated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      session: { access_token: "test-token" },
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
  });

  describe("Rendering", () => {
    it("renders modal with correct title and description", () => {
      render(<AssetEditModal {...defaultProps} />);

      expect(screen.getByText("Edit Asset")).toBeInTheDocument();
      expect(screen.getByText(/Update asset details/)).toBeInTheDocument();
    });

    it("shows loading state when fetching asset data", () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<AssetEditModal {...defaultProps} />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders form fields when asset data is loaded", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("ASSET-001")).toBeInTheDocument();
        expect(screen.getByDisplayValue("SN123456")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1200.00")).toBeInTheDocument();
      });
    });

    it("shows error message when asset not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Asset not found.")).toBeInTheDocument();
      });
    });

    it("shows error message when API call fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load asset data.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Interactions", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });
    });

    it("allows editing form fields", async () => {
      const user = userEvent.setup();
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Laptop");

      expect(screen.getByDisplayValue("Updated Laptop")).toBeInTheDocument();
    });

    it("disables asset number field", async () => {
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        const assetNumberInput = screen.getByDisplayValue("ASSET-001");
        expect(assetNumberInput).toBeDisabled();
      });
    });

    it("updates form state when type is changed", async () => {
      const user = userEvent.setup();
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(ASSET_TYPE_LABELS[AssetType.LAPTOP])
        ).toBeInTheDocument();
      });

      const typeSelect = screen.getByRole("combobox", { name: /type/i });
      await user.click(typeSelect);

      const desktopOption = screen.getByText(ASSET_TYPE_LABELS.desktop);
      await user.click(desktopOption);

      expect(screen.getByText(ASSET_TYPE_LABELS.desktop)).toBeInTheDocument();
    });

    it("updates form state when state is changed", async () => {
      const user = userEvent.setup();
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getAllByText(ASSET_STATE_LABELS[AssetState.SIGNED_OUT])
        ).toHaveLength(2);
      });

      const stateSelect = screen.getAllByRole("combobox")[1]; // Second combobox is state
      await user.click(stateSelect);

      const issuedOption = screen.getByText(
        ASSET_STATE_LABELS[AssetState.ISSUED]
      );
      await user.click(issuedOption);

      expect(
        screen.getByText(ASSET_STATE_LABELS[AssetState.ISSUED])
      ).toBeInTheDocument();
    });

    it("tracks form dirty state correctly", async () => {
      const user = userEvent.setup();
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Initially, update button should be disabled (no changes)
      const updateButton = screen.getByRole("button", { name: /update/i });
      expect(updateButton).toBeDisabled();

      // Make a change
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Now update button should be enabled
      expect(screen.getByRole("button", { name: /update/i })).toBeEnabled();
    });
  });

  describe("Form Submission", () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });
    });

    it("submits form with updated data", async () => {
      const user = userEvent.setup();
      const onUpdated = jest.fn();
      const onOpenChange = jest.fn();

      // Mock the update API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <AssetEditModal
          {...defaultProps}
          onUpdated={onUpdated}
          onOpenChange={onOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Submit form
      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/assets/ASSET-001",
          expect.objectContaining({
            method: "PATCH",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            }),
            body: expect.stringContaining("Updated Description"),
          })
        );
      });

      expect(onUpdated).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      // Mock the initial asset fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change to make form dirty
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Mock a slow update response
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

      // Submit form
      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText("Updating...")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
    });

    it("handles submission errors", async () => {
      const user = userEvent.setup();

      // Mock the initial asset fetch and the update API call to fail
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockAsset }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Submit form
      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to update asset.")).toBeInTheDocument();
      });
    });

    it("handles network errors during submission", async () => {
      const user = userEvent.setup();

      // Mock the initial asset fetch and the update API call to fail
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockAsset }),
        })
        .mockRejectedValueOnce(new Error("Network error"));

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Submit form
      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to update asset.")).toBeInTheDocument();
      });
    });

    it("prevents submission when form is not dirty", async () => {
      const user = userEvent.setup();

      // Mock the initial asset fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Try to submit without changes
      const updateButton = screen.getByRole("button", { name: /update/i });
      expect(updateButton).toBeDisabled();

      await user.click(updateButton);

      // Should not make API call
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial fetch
    });
  });

  describe("Modal Interactions", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });
    });

    it("closes modal when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();

      render(<AssetEditModal {...defaultProps} onOpenChange={onOpenChange} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("disables cancel button during submission", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockAsset }),
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ ok: true }), 100)
            )
        );

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change and submit
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      // Cancel button should be disabled during submission
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });
  });

  describe("Authentication", () => {
    it("includes authorization header when session has access token", async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        session: { access_token: "test-token" },
        user: null,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      // Mock the update API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Submit form
      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/assets/ASSET-001",
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: "Bearer test-token",
            }),
          })
        );
      });
    });

    it("submits without authorization header when no access token", async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        session: null,
        user: null,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      // Mock the initial asset fetch and the update API call
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockAsset }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Make a change
      const descriptionInput = screen.getByDisplayValue("Test Laptop");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated Description");

      // Submit form
      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/assets/ASSET-001",
          expect.objectContaining({
            headers: expect.not.objectContaining({
              Authorization: expect.any(String),
            }),
          })
        );
      });
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });
    });

    it("has proper ARIA labels and roles", async () => {
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Check for proper labels - using text content instead of label association
      expect(screen.getByText(/asset number/i)).toBeInTheDocument();
      expect(screen.getByText(/type/i)).toBeInTheDocument();
      expect(screen.getByText(/state/i)).toBeInTheDocument();
      expect(screen.getByText(/serial number/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
      expect(screen.getByText(/purchase price/i)).toBeInTheDocument();
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Tab through form elements - disabled asset number field is skipped
      await user.tab();
      expect(screen.getByRole("combobox")).toHaveFocus();

      await user.tab();
      expect(screen.getByDisplayValue("SN123456")).toHaveFocus();
    });

    it("has proper form structure", async () => {
      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      // Check submit button is properly associated
      const submitButton = screen.getByRole("button", { name: /update/i });
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Edge Cases", () => {
    it("handles null assetNumber", () => {
      render(<AssetEditModal {...defaultProps} assetNumber={null} />);

      // Should not make API call
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles empty assetNumber", () => {
      render(<AssetEditModal {...defaultProps} assetNumber="" />);

      // Should not make API call
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles modal closed state", () => {
      render(<AssetEditModal {...defaultProps} open={false} />);

      // Should not make API call when modal is closed
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles asset with missing optional fields", async () => {
      const assetWithoutOptionalFields = {
        assetNumber: "ASSET-002",
        type: AssetType.LAPTOP,
        state: AssetState.SIGNED_OUT,
        serialNumber: "SN789",
        description: "Test Asset",
        purchasePrice: "800.00",
        location: "Office B",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: assetWithoutOptionalFields }),
      });

      render(<AssetEditModal {...defaultProps} assetNumber="ASSET-002" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("ASSET-002")).toBeInTheDocument();
        expect(screen.getByDisplayValue("SN789")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Asset")).toBeInTheDocument();
      });
    });

    it("handles rapid form changes", async () => {
      const user = userEvent.setup();

      // Mock the initial asset fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAsset }),
      });

      render(<AssetEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
      });

      const descriptionInput = screen.getByDisplayValue("Test Laptop");

      // Rapid typing
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Rapid");
      await user.type(descriptionInput, "Change");
      await user.type(descriptionInput, "Test");

      expect(screen.getByDisplayValue("RapidChangeTest")).toBeInTheDocument();
    });
  });
});
