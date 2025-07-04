// frontend/components/layout/header.test.tsx
// Unit/functional tests for the Header component

import React from "react";
import { render, screen, fireEvent, waitFor } from "../../lib/test-utils";

// Mock the SearchResultsModal component
jest.mock("../search/search-results-modal", () => ({
  SearchResultsModal: ({ isOpen, onClose, results, isLoading, query }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="search-results-modal">
        <button onClick={onClose}>Close Modal</button>
        <span>Query: {query}</span>
        <span>Loading: {isLoading.toString()}</span>
        <span>Results: {JSON.stringify(results)}</span>
      </div>
    );
  },
}));

// Mock fetch for search API
global.fetch = jest.fn();

import { Header } from "./header";

describe("Header", () => {
  const mockOnMobileMenuToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header with search bar and user menu", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    expect(
      screen.getByPlaceholderText("Search assets, users, or locations...")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("User menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("shows mobile menu button on mobile", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveClass("md:hidden");
  });

  it("calls onMobileMenuToggle when mobile menu button is clicked", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const mobileMenuButton = screen.getByLabelText("Open mobile menu");
    fireEvent.click(mobileMenuButton);

    expect(mockOnMobileMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("displays user information in dropdown", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@company.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows user avatar with initials fallback", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    // Check for avatar with initials
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("displays dropdown menu items", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("handles search input changes", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const searchInput = screen.getByPlaceholderText(
      "Search assets, users, or locations..."
    );
    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(searchInput).toHaveValue("test search");
  });

  it("performs search on Enter key press", async () => {
    const mockSearchResults = {
      assets: [{ id: "1", assetNumber: "ASSET-001" }],
      users: [],
      locations: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSearchResults }),
    });

    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const searchInput = screen.getByPlaceholderText(
      "Search assets, users, or locations..."
    );
    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/search?q=test");
    });

    await waitFor(() => {
      expect(screen.getByTestId("search-results-modal")).toBeInTheDocument();
    });
  });

  it("does not search for queries less than 2 characters", () => {
    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const searchInput = screen.getByPlaceholderText(
      "Search assets, users, or locations..."
    );
    fireEvent.change(searchInput, { target: { value: "a" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handles search API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Search failed" }),
    });

    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const searchInput = screen.getByPlaceholderText(
      "Search assets, users, or locations..."
    );
    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/search?q=test");
    });

    // Should not show modal on error
    expect(
      screen.queryByTestId("search-results-modal")
    ).not.toBeInTheDocument();
  });

  it("closes search modal when close button is clicked", async () => {
    const mockSearchResults = {
      assets: [{ id: "1", assetNumber: "ASSET-001" }],
      users: [],
      locations: [],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSearchResults }),
    });

    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const searchInput = screen.getByPlaceholderText(
      "Search assets, users, or locations..."
    );
    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("search-results-modal")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close Modal");
    fireEvent.click(closeButton);

    expect(
      screen.queryByTestId("search-results-modal")
    ).not.toBeInTheDocument();
  });

  it("shows loading state during search", async () => {
    // Mock a delayed response
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  data: { assets: [], users: [], locations: [] },
                }),
              }),
            100
          )
        )
    );

    render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />);

    const searchInput = screen.getByPlaceholderText(
      "Search assets, users, or locations..."
    );
    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("search-results-modal")).toBeInTheDocument();
      expect(screen.getByText("Loading: true")).toBeInTheDocument();
    });
  });
});
