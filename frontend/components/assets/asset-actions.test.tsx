// frontend/components/assets/asset-actions.test.tsx

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

// Unit tests for AssetActions component

import React from "react";
import { render, screen } from "../../lib/test-utils";
import { AssetActions } from "./asset-actions";

// Mock the auth context
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    session: {
      access_token: "mock-token",
    },
  }),
}));

// Mock the dropdown menu components to avoid floating UI issues
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        "data-testid": "dropdown-trigger",
      });
    }
    return <div data-testid="dropdown-trigger">{children}</div>;
  },
}));

describe("AssetActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders nothing when no assets are selected", () => {
      render(<AssetActions />);
      // Component should not render anything when no assets are selected
      expect(screen.queryByText(/asset.*selected/i)).not.toBeInTheDocument();
    });

    it("renders the component when assets are selected", () => {
      // Mock useState to return selected assets
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1", "2", "3"], mockSetSelectedAssets]);

      render(<AssetActions />);

      // Check that the component renders with selected assets
      expect(screen.getByText("3 assets selected")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument(); // Badge count
    });

    it("renders singular text for one asset", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1"], mockSetSelectedAssets]);

      render(<AssetActions />);

      expect(screen.getByText("1 asset selected")).toBeInTheDocument();
    });

    it("renders all action buttons when assets are selected", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1", "2"], mockSetSelectedAssets]);

      render(<AssetActions />);

      // Check for all action buttons
      expect(screen.getByText("Move Location")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
      expect(screen.getByText("Clear Selection")).toBeInTheDocument();

      // Check for dropdown trigger
      expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("renders with correct layout structure", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1", "2"], mockSetSelectedAssets]);

      const { container } = render(<AssetActions />);

      // Check for main container classes
      const mainContainer = container.querySelector('[class*="flex"]');
      expect(mainContainer).toBeInTheDocument();
    });

    it("renders badge with correct styling", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1", "2", "3"], mockSetSelectedAssets]);

      render(<AssetActions />);

      const badge = screen.getByText("3");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("handles empty array of selected assets", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([[], mockSetSelectedAssets]);

      render(<AssetActions />);
      expect(screen.queryByText(/asset.*selected/i)).not.toBeInTheDocument();
    });

    it("handles large number of selected assets", () => {
      const mockSetSelectedAssets = jest.fn();
      const largeAssetArray = Array.from(
        { length: 1000 },
        (_, i) => `asset-${i}`
      );
      jest
        .spyOn(React, "useState")
        .mockReturnValue([largeAssetArray, mockSetSelectedAssets]);

      render(<AssetActions />);

      expect(screen.getByText("1000 assets selected")).toBeInTheDocument();
      expect(screen.getByText("1000")).toBeInTheDocument(); // Badge count
    });

    it("handles undefined selected assets gracefully", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([
          undefined as unknown as string[],
          mockSetSelectedAssets,
        ]);

      render(<AssetActions />);
      // Component should handle undefined gracefully
      expect(screen.queryByText(/asset.*selected/i)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper button roles", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1", "2"], mockSetSelectedAssets]);

      render(<AssetActions />);

      // Check for proper button roles
      expect(
        screen.getByRole("button", { name: "Move Location" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Export" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Clear Selection" })
      ).toBeInTheDocument();
    });

    it("renders dropdown menu structure", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([["1", "2"], mockSetSelectedAssets]);

      render(<AssetActions />);

      expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null selected assets", () => {
      const mockSetSelectedAssets = jest.fn();
      jest
        .spyOn(React, "useState")
        .mockReturnValue([null as unknown as string[], mockSetSelectedAssets]);

      render(<AssetActions />);
      expect(screen.queryByText(/asset.*selected/i)).not.toBeInTheDocument();
    });

    it("handles very long asset IDs", () => {
      const mockSetSelectedAssets = jest.fn();
      const longAssetId = "A".repeat(100);
      jest
        .spyOn(React, "useState")
        .mockReturnValue([[longAssetId], mockSetSelectedAssets]);

      render(<AssetActions />);
      expect(screen.getByText("1 asset selected")).toBeInTheDocument();
    });
  });
});
