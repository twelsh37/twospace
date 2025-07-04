// frontend/app/imports/page.test.tsx
// Unit/functional tests for the ImportsPage

import React from "react";
import { render, screen, fireEvent, waitFor } from "../../lib/test-utils";

// Mock the ImportModal component
jest.mock("../../components/imports/import-modal", () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }: any) => {
    if (!open) return null;
    return (
      <div data-testid="import-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSuccess}>Import Success</button>
      </div>
    );
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

import ImportsPage from "./page";

describe("ImportsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders imports page with title and description", () => {
    render(<ImportsPage />);

    expect(screen.getByText("Bulk Import Data")).toBeInTheDocument();
    expect(
      screen.getByText(/System Administrators can bulk import/)
    ).toBeInTheDocument();
    expect(screen.getByText("Import Data")).toBeInTheDocument();
  });

  it("opens import modal when Import Data button is clicked", () => {
    render(<ImportsPage />);

    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);

    expect(screen.getByTestId("import-modal")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", () => {
    render(<ImportsPage />);

    // Open modal
    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);
    expect(screen.getByTestId("import-modal")).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText("Close Modal");
    fireEvent.click(closeButton);
    expect(screen.queryByTestId("import-modal")).not.toBeInTheDocument();
  });

  it("displays imported data table when data is available", async () => {
    const mockAssets = [
      {
        assetNumber: "ASSET-001",
        type: "LAPTOP",
        state: "AVAILABLE",
        serialNumber: "SN123",
        description: "Test Laptop",
        purchasePrice: 1000,
        status: "holding",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { assets: mockAssets } }),
    });

    render(<ImportsPage />);

    // Trigger import success
    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);

    const successButton = screen.getByText("Import Success");
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText("Recently Imported Data")).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText("Asset Number")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();

    // Check table data
    expect(screen.getByText("ASSET-001")).toBeInTheDocument();
    expect(screen.getByText("LAPTOP")).toBeInTheDocument();
  });

  it("handles API errors gracefully when fetching imported data", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to fetch" }),
    });

    render(<ImportsPage />);

    // Trigger import success
    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);

    const successButton = screen.getByText("Import Success");
    fireEvent.click(successButton);

    // Should not show the table when there's an error
    await waitFor(() => {
      expect(
        screen.queryByText("Recently Imported Data")
      ).not.toBeInTheDocument();
    });
  });

  it("formats currency values correctly", async () => {
    const mockAssets = [
      {
        assetNumber: "ASSET-001",
        type: "LAPTOP",
        state: "AVAILABLE",
        serialNumber: "SN123",
        description: "Test Laptop",
        purchasePrice: 1500.5,
        status: "holding",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { assets: mockAssets } }),
    });

    render(<ImportsPage />);

    // Trigger import success
    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);

    const successButton = screen.getByText("Import Success");
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText("Recently Imported Data")).toBeInTheDocument();
    });

    // Check that currency is formatted
    expect(screen.getByText(/£1,500.50/)).toBeInTheDocument();
  });

  it("maps imported state values correctly", async () => {
    const mockAssets = [
      {
        assetNumber: "ASSET-001",
        type: "LAPTOP",
        state: "ISSUED", // This should be mapped to display label
        serialNumber: "SN123",
        description: "Test Laptop",
        purchasePrice: 1000,
        status: "holding",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { assets: mockAssets } }),
    });

    render(<ImportsPage />);

    // Trigger import success
    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);

    const successButton = screen.getByText("Import Success");
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText("Recently Imported Data")).toBeInTheDocument();
    });

    // Check that state is mapped to display label
    expect(screen.getByText("Issued")).toBeInTheDocument();
  });

  it("shows default values for missing data", async () => {
    const mockAssets = [
      {
        assetNumber: "ASSET-001",
        type: "LAPTOP",
        state: "AVAILABLE",
        serialNumber: "",
        description: "",
        purchasePrice: null,
        status: "holding",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { assets: mockAssets } }),
    });

    render(<ImportsPage />);

    // Trigger import success
    const importButton = screen.getByText("Import Data");
    fireEvent.click(importButton);

    const successButton = screen.getByText("Import Success");
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText("Recently Imported Data")).toBeInTheDocument();
    });

    // Check default values
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("IT Department - Store room")).toBeInTheDocument();
  });
});
