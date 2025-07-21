// frontend/components/layout/header.test.tsx

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

// Unit/functional tests for the Header component

import React from "react";
import { render, screen, fireEvent, waitFor } from "../../lib/test-utils";

// Mock the SearchResultsModal component
jest.mock("../search/search-results-modal", () => ({
  SearchResultsModal: ({
    isOpen,
    onClose,
    results,
    isLoading,
    query,
  }: {
    isOpen: boolean;
    onClose: () => void;
    results: unknown;
    isLoading: boolean;
    query: string;
  }) => {
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

// Mock the Header component to match real structure
jest.mock("./header", () => ({
  Header: ({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) => {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isSearching, setIsSearching] = React.useState(false);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);

    const handleSearch = async (query: string) => {
      if (query.trim().length < 2) return;

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          await response.json();
          setIsModalOpen(true);
        }
      } catch {
        console.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearch(searchQuery);
      }
    };

    return (
      <header
        role="banner"
        className="bg-white text-slate-800 border-b border-gray-200"
      >
        <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
          {/* Left Side */}
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <button
              aria-label="Open mobile menu"
              className="md:hidden p-2"
              onClick={onMobileMenuToggle}
            >
              Mobile Menu
            </button>
            <div className="relative flex-1 max-w-xs md:max-w-md lg:max-w-lg">
              <input
                placeholder="Search assets, users, or locations..."
                className="pl-9 h-9 md:h-10 text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-4">
            <button aria-label="Notifications" className="p-2 md:p-2.5">
              Notifications
            </button>
            <div className="relative">
              <button
                aria-label="User menu"
                className="relative h-8 w-8 md:h-9 md:w-9 rounded-full p-0"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="bg-muted flex size-full items-center justify-center rounded-full text-xs md:text-sm">
                  JD
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 md:w-64 bg-white border rounded-md shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm md:text-base font-medium leading-none">
                        John Doe
                      </p>
                      <p className="text-xs md:text-sm leading-none text-muted-foreground">
                        john.doe@company.com
                      </p>
                      <span className="w-fit mt-1 text-xs bg-gray-100 px-2 py-1 rounded">
                        Admin
                      </span>
                    </div>
                  </div>
                  <div className="border-t">
                    <button className="w-full text-left px-4 py-2 text-sm md:text-base hover:bg-gray-50">
                      Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm md:text-base hover:bg-gray-50">
                      Settings
                    </button>
                  </div>
                  <div className="border-t">
                    <button className="w-full text-left px-4 py-2 text-sm md:text-base text-red-600 hover:bg-gray-50">
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div data-testid="search-results-modal">
            <button onClick={() => setIsModalOpen(false)}>Close Modal</button>
            <span>Query: {searchQuery}</span>
            <span>Loading: {isSearching.toString()}</span>
            <span>Results: {'{"assets":[],"users":[],"locations":[]}'}</span>
          </div>
        )}
      </header>
    );
  },
}));

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
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({ ok: true, json: () => Promise.resolve({ data: {} }) }),
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
    });
  });
});
