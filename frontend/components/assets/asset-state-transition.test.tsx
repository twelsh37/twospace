// frontend/components/assets/asset-state-transition.test.tsx
// Comprehensive UI tests for AssetStateTransition component

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetStateTransition } from "./asset-state-transition";
import { Asset, AssetState } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "react-hot-toast";

// Mock dependencies
jest.mock("@/lib/auth-context");
jest.mock("react-hot-toast");
jest.mock("swr", () => ({
  mutate: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock fetch
global.fetch = jest.fn();

// Test data
const mockAsset: Asset = {
  assetNumber: "LAPTOP-001",
  type: "LAPTOP",
  state: AssetState.AVAILABLE,
  description: "Test Laptop",
  purchasePrice: 999.99,
  purchaseDate: "2024-01-01",
  locationId: "loc-1",
  userId: null,
  departmentId: "dept-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  role: "admin" as const,
};

const mockSession = {
  access_token: "mock-token",
};

describe("AssetStateTransition", () => {
  const mockSetAsset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: mockSession,
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockAsset }),
    });
  });

  describe("Basic Rendering", () => {
    it("renders state transition component", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      expect(screen.getByText("State Transition")).toBeInTheDocument();
      expect(screen.getByText("Available Stock")).toBeInTheDocument();
    });

    it("renders with different asset types", () => {
      const monitorAsset = { ...mockAsset, type: "MONITOR" as const };
      render(
        <AssetStateTransition asset={monitorAsset} setAsset={mockSetAsset} />
      );
      expect(screen.getByText("State Transition")).toBeInTheDocument();
    });

    it("renders with different asset states", () => {
      const signedOutAsset = { ...mockAsset, state: AssetState.SIGNED_OUT };
      render(
        <AssetStateTransition asset={signedOutAsset} setAsset={mockSetAsset} />
      );
      expect(screen.getByText("State Transition")).toBeInTheDocument();
    });

    it("renders transition rules section", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      expect(screen.getByText("Transition Rules:")).toBeInTheDocument();
      expect(screen.getByText(/State changes are tracked/)).toBeInTheDocument();
      expect(
        screen.getByText(/Issued assets can only return/)
      ).toBeInTheDocument();
    });
  });

  describe("State Badge Display", () => {
    it("displays all lifecycle states for laptop", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      expect(screen.getByText("Available Stock")).toBeInTheDocument();
      expect(screen.getByText("Signed Out")).toBeInTheDocument();
      expect(screen.getByText("Building")).toBeInTheDocument();
      expect(screen.getByText("Ready to Go")).toBeInTheDocument();
      expect(screen.getByText("Issued")).toBeInTheDocument();
    });

    it("displays correct states for monitor (skips Building)", () => {
      const monitorAsset = { ...mockAsset, type: "MONITOR" as const };
      render(
        <AssetStateTransition asset={monitorAsset} setAsset={mockSetAsset} />
      );
      expect(screen.getByText("Available Stock")).toBeInTheDocument();
      expect(screen.getByText("Signed Out")).toBeInTheDocument();
      expect(screen.getByText("Ready to Go")).toBeInTheDocument();
      expect(screen.getByText("Issued")).toBeInTheDocument();
      expect(screen.queryByText("Building")).not.toBeInTheDocument();
    });

    it("highlights current state correctly", () => {
      const signedOutAsset = { ...mockAsset, state: AssetState.SIGNED_OUT };
      render(
        <AssetStateTransition asset={signedOutAsset} setAsset={mockSetAsset} />
      );
      const signedOutBadge = screen.getByText("Signed Out");
      expect(signedOutBadge).toHaveAttribute("aria-current", "step");
    });

    it("shows next available states as clickable", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      const signedOutBadge = screen.getByText("Signed Out");
      expect(signedOutBadge).not.toBeDisabled();
    });
  });

  describe("State Transition Interactions", () => {
    it("shows confirmation modal when clicking next state", async () => {
      const user = userEvent.setup();
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      expect(screen.getByText("Confirm Transition")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to transition/)
      ).toBeInTheDocument();
    });

    it("shows error toast when clicking invalid transition", async () => {
      const user = userEvent.setup();
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const issuedBadge = screen.getByText("Issued");
      await user.click(issuedBadge);

      expect(mockToast.error).toHaveBeenCalledWith(
        "This is not a valid transition"
      );
    });

    it("shows error toast when clicking current state", async () => {
      const user = userEvent.setup();
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const availableBadge = screen.getByText("Available Stock");
      await user.click(availableBadge);

      expect(mockToast.error).toHaveBeenCalledWith(
        "This is not a valid transition"
      );
    });

    it("closes modal when clicking cancel", async () => {
      const user = userEvent.setup();
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(screen.queryByText("Confirm Transition")).not.toBeInTheDocument();
    });
  });

  describe("State Transition API Calls", () => {
    it("makes API call when confirming transition", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/assets", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
          body: JSON.stringify({
            assetIds: ["LAPTOP-001"],
            operation: "stateTransition",
            payload: { newState: AssetState.SIGNED_OUT, userId: "user-1" },
          }),
        });
      });
    });

    it("updates asset state after successful transition", async () => {
      const user = userEvent.setup();
      const updatedAsset = { ...mockAsset, state: AssetState.SIGNED_OUT };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: updatedAsset }),
        });

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockSetAsset).toHaveBeenCalledWith(updatedAsset);
      });
    });

    it("shows loading state during transition", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();
    });

    it("handles API errors gracefully", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: false, error: "Transition failed" }),
      });

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Transition failed")).toBeInTheDocument();
      });
    });

    it("handles network errors", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });
  });

  describe("Authentication Handling", () => {
    it("shows error when user is not authenticated", async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        loading: false,
      });

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText("You must be signed in to perform this action.")
        ).toBeInTheDocument();
      });
    });

    it("shows error when session token is missing", async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        loading: false,
      });

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Authentication token not found. Please sign in again."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes for current state", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      const availableBadge = screen.getByText("Available Stock");
      expect(availableBadge).toHaveAttribute("aria-current", "step");
    });

    it("has proper tabindex for clickable states", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      const signedOutBadge = screen.getByText("Signed Out");
      expect(signedOutBadge).toHaveAttribute("tabIndex", "0");
    });

    it("has proper tabindex for non-clickable states", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );
      const issuedBadge = screen.getByText("Issued");
      expect(issuedBadge).toHaveAttribute("tabIndex", "-1");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      signedOutBadge.focus();

      await user.keyboard("{Enter}");

      expect(screen.getByText("Confirm Transition")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles asset with unknown state", () => {
      const unknownStateAsset = {
        ...mockAsset,
        state: "UNKNOWN" as AssetState,
      };
      render(
        <AssetStateTransition
          asset={unknownStateAsset}
          setAsset={mockSetAsset}
        />
      );
      expect(screen.getByText("State Transition")).toBeInTheDocument();
    });

    it("handles asset with unknown type", () => {
      const unknownTypeAsset = {
        ...mockAsset,
        type: "UNKNOWN" as unknown as AssetType,
      };
      render(
        <AssetStateTransition
          asset={unknownTypeAsset}
          setAsset={mockSetAsset}
        />
      );
      expect(screen.getByText("State Transition")).toBeInTheDocument();
    });

    it("handles rapid state transitions", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockAsset }),
      });

      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const signedOutBadge = screen.getByText("Signed Out");
      await user.click(signedOutBadge);

      const confirmButton = screen.getByText("Confirm");
      await user.click(confirmButton);
      await user.click(confirmButton); // Try to click again

      // Should only make one API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + updated asset fetch
      });
    });
  });

  describe("Visual States", () => {
    it("applies correct color classes for different states", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      const availableBadge = screen.getByText("Available Stock");
      expect(availableBadge.className).toMatch(/bg-blue-600/);

      const signedOutBadge = screen.getByText("Signed Out");
      expect(signedOutBadge.className).toMatch(/bg-teal-600/);

      const buildingBadge = screen.getByText("Building");
      expect(buildingBadge.className).toMatch(/bg-orange-500/);

      const readyBadge = screen.getByText("Ready to Go");
      expect(readyBadge.className).toMatch(/bg-purple-600/);

      const issuedBadge = screen.getByText("Issued");
      expect(issuedBadge.className).toMatch(/bg-green-600/);
    });

    it("shows connecting lines between states", () => {
      render(
        <AssetStateTransition asset={mockAsset} setAsset={mockSetAsset} />
      );

      // Check that connecting lines are present (they have flex-1 class)
      const container = screen
        .getByText("State Transition")
        .closest(".space-y-4");
      expect(container).toBeInTheDocument();
    });
  });
});
