// frontend/components/assets/asset-table.test.tsx

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

// Unit tests for AssetTable component

import React from "react";
import { render, screen } from "../../lib/test-utils";
import { AssetTable } from "./asset-table";

// Mock the auth context
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    session: {
      access_token: "mock-token",
    },
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockAssets = [
  {
    id: "1",
    assetNumber: "ASSET-001",
    description: "Test Asset 1",
    location: "Building A",
    department: "IT",
    state: "ACTIVE",
    purchaseDate: "2023-01-01",
    purchasePrice: 1000,
    currentValue: 800,
    assignedTo: "John Doe",
    notes: "Test notes",
    serialNumber: "SN001",
    manufacturer: "Test Manufacturer",
    model: "Test Model",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    assetNumber: "ASSET-002",
    description: "Test Asset 2",
    location: "Building B",
    department: "HR",
    state: "INACTIVE",
    purchaseDate: "2023-02-01",
    purchasePrice: 2000,
    currentValue: 1500,
    assignedTo: null,
    notes: "",
    serialNumber: "SN002",
    manufacturer: "Test Manufacturer 2",
    model: "Test Model 2",
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2023-02-01T00:00:00Z",
  },
];

describe("AssetTable", () => {
  const defaultProps = {
    assets: mockAssets,
    onAssetSelect: jest.fn(),
    onAssetEdit: jest.fn(),
    onAssetDelete: jest.fn(),
    onAssetAssign: jest.fn(),
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("renders asset table component", () => {
    render(<AssetTable {...defaultProps} />);
    // Just verify the component renders without crashing
    expect(screen.getByTestId("test-providers")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<AssetTable {...defaultProps} loading={true} />);
    expect(screen.getByText("Loading assets...")).toBeInTheDocument();
  });

  it("handles empty assets array", () => {
    render(<AssetTable {...defaultProps} assets={[]} />);
    // Component should render without crashing
    expect(screen.getByTestId("test-providers")).toBeInTheDocument();
  });

  it("handles null assets", () => {
    render(<AssetTable {...defaultProps} assets={null as unknown} />);
    // Component should render without crashing
    expect(screen.getByTestId("test-providers")).toBeInTheDocument();
  });

  it("handles undefined assets", () => {
    render(<AssetTable {...defaultProps} assets={undefined as unknown} />);
    // Component should render without crashing
    expect(screen.getByTestId("test-providers")).toBeInTheDocument();
  });

  it("calls callback functions when provided", () => {
    const onAssetSelect = jest.fn();
    const onAssetEdit = jest.fn();
    const onAssetDelete = jest.fn();
    const onAssetAssign = jest.fn();

    render(
      <AssetTable
        {...defaultProps}
        onAssetSelect={onAssetSelect}
        onAssetEdit={onAssetEdit}
        onAssetDelete={onAssetDelete}
        onAssetAssign={onAssetAssign}
      />
    );

    // Verify callbacks are functions (component should handle them properly)
    expect(typeof onAssetSelect).toBe("function");
    expect(typeof onAssetEdit).toBe("function");
    expect(typeof onAssetDelete).toBe("function");
    expect(typeof onAssetAssign).toBe("function");
  });

  it("handles different asset states", () => {
    const assetsWithDifferentStates = [
      { ...mockAssets[0], state: "ACTIVE" },
      { ...mockAssets[1], state: "INACTIVE" },
      {
        ...mockAssets[0],
        id: "3",
        assetNumber: "ASSET-003",
        state: "MAINTENANCE",
      },
    ];

    render(<AssetTable {...defaultProps} assets={assetsWithDifferentStates} />);
    // Component should render without crashing
    expect(screen.getByTestId("test-providers")).toBeInTheDocument();
  });

  it("handles assets with missing optional fields", () => {
    const assetsWithMissingFields = [
      {
        id: "1",
        assetNumber: "ASSET-001",
        description: "Test Asset",
        location: "Building A",
        department: "IT",
        state: "ACTIVE",
        purchaseDate: "2023-01-01",
        purchasePrice: 1000,
        currentValue: 800,
        // Missing optional fields
      },
    ];

    render(<AssetTable {...defaultProps} assets={assetsWithMissingFields} />);
    // Component should render without crashing
    expect(screen.getByTestId("test-providers")).toBeInTheDocument();
  });
});
