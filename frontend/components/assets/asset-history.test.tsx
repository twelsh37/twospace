// frontend/components/assets/asset-history.test.tsx

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

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AssetHistory } from "./asset-history";
import { AssetState } from "@/lib/types";
import { ASSET_STATE_LABELS } from "@/lib/constants";

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import useSWR from "swr";
const mockSWR = useSWR as jest.Mock;

// Sample history data for testing
const mockHistoryData = [
  {
    previousState: AssetState.AVAILABLE,
    newState: AssetState.SIGNED_OUT,
    changedBy: "user1",
    timestamp: "2024-01-15T10:30:00Z",
    changeReason: "Asset assigned to employee",
    userName: "John Doe",
  },
  {
    newState: AssetState.BUILDING,
    changedBy: "user2",
    timestamp: "2024-01-16T14:20:00Z",
    changeReason: "Bulk state transition",
    userName: "Jane Smith",
  },
  {
    previousState: AssetState.BUILDING,
    newState: AssetState.READY_TO_GO,
    changedBy: "user3",
    timestamp: "2024-01-17T09:15:00Z",
    changeReason: "Asset ready for deployment",
    userName: "Bob Wilson",
  },
];

describe("AssetHistory", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockSWR.mockClear();
  });

  describe("Rendering", () => {
    it("renders component with title and icon", () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      expect(screen.getByText("Asset History")).toBeInTheDocument();
      expect(document.querySelector(".lucide-history")).toBeInTheDocument();
    });

    it("renders loading state when data is being fetched", () => {
      mockSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      expect(screen.getByText("Loading history...")).toBeInTheDocument();
    });

    it("renders error state when fetch fails", () => {
      mockSWR.mockReturnValue({
        data: undefined,
        error: new Error("Failed to fetch"),
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      expect(screen.getByText("Error loading history")).toBeInTheDocument();
    });

    it("renders empty state when no history available", () => {
      mockSWR.mockReturnValue({
        data: { data: [] },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      expect(
        screen.getByText("No history available for this asset")
      ).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    it("displays history entries with correct information", async () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Check state transitions
        expect(
          screen.getByText(ASSET_STATE_LABELS[AssetState.AVAILABLE])
        ).toBeInTheDocument();
        expect(
          screen.getByText(ASSET_STATE_LABELS[AssetState.SIGNED_OUT])
        ).toBeInTheDocument();
        expect(
          screen.getAllByText(ASSET_STATE_LABELS[AssetState.BUILDING])
        ).toHaveLength(2); // Appears twice
        expect(
          screen.getByText(ASSET_STATE_LABELS[AssetState.READY_TO_GO])
        ).toBeInTheDocument();

        // Check user names
        expect(screen.getByText("By: John Doe")).toBeInTheDocument();
        expect(screen.getByText("By: Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("By: Bob Wilson")).toBeInTheDocument();

        // Check change reasons
        expect(
          screen.getByText("Asset assigned to employee")
        ).toBeInTheDocument();
        expect(screen.getByText("State Transition")).toBeInTheDocument(); // Bulk transition should be renamed
        expect(
          screen.getByText("Asset ready for deployment")
        ).toBeInTheDocument();
      });
    });

    it("displays timestamps in readable format", async () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Check that timestamps are displayed (format may vary by locale)
        const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });

    it("shows arrow between state transitions", async () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Check for arrow icons between state transitions
        const arrows = document.querySelectorAll(".lucide-arrow-right");
        expect(arrows.length).toBeGreaterThan(0);
      });
    });

    it("limits history to 6 most recent entries", async () => {
      const longHistoryData = Array.from({ length: 10 }, (_, i) => ({
        newState: AssetState.AVAILABLE,
        changedBy: `user${i}`,
        timestamp: `2024-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        changeReason: `Change ${i + 1}`,
        userName: `User ${i + 1}`,
      }));

      mockSWR.mockReturnValue({
        data: { data: longHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Should only show 6 entries
        const userElements = screen.getAllByText(/By: User \d+/);
        expect(userElements).toHaveLength(6);
      });
    });
  });

  describe("State Colors", () => {
    it("applies correct color classes for different states", async () => {
      const stateTestData = [
        { newState: AssetState.AVAILABLE, userName: "User 1" },
        { newState: AssetState.SIGNED_OUT, userName: "User 2" },
        { newState: AssetState.BUILDING, userName: "User 3" },
        { newState: AssetState.READY_TO_GO, userName: "User 4" },
        { newState: AssetState.ISSUED, userName: "User 5" },
      ];

      mockSWR.mockReturnValue({
        data: { data: stateTestData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Check that badges have appropriate color classes
        const badges = screen.getAllByText(
          /Available|Signed Out|Building|Ready to Go|Issued/
        );
        expect(badges.length).toBeGreaterThan(0);

        // Check for specific color classes
        const blueBadge = screen.getByText(
          ASSET_STATE_LABELS[AssetState.AVAILABLE]
        );
        expect(blueBadge).toHaveClass("bg-blue-600");

        const tealBadge = screen.getByText(
          ASSET_STATE_LABELS[AssetState.SIGNED_OUT]
        );
        expect(tealBadge).toHaveClass("bg-teal-600");
      });
    });
  });

  describe("SWR Integration", () => {
    it("calls SWR with correct URL when assetNumber is provided", () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      expect(mockSWR).toHaveBeenCalledWith(
        "/api/assets/ASSET-001/history",
        expect.any(Function)
      );
    });

    it("does not call SWR when assetNumber is not provided", () => {
      mockSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory />);

      expect(mockSWR).toHaveBeenCalledWith(null, expect.any(Function));
    });

    it("handles SWR fetcher function correctly", async () => {
      const mockResponse = { data: mockHistoryData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      mockSWR.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      // Get the fetcher function that was passed to SWR
      const fetcherFunction = mockSWR.mock.calls[0][1];

      // Test the fetcher function
      const result = await fetcherFunction("/api/assets/ASSET-001/history");
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/assets/ASSET-001/history");
    });

    it("handles SWR fetcher error correctly", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      mockSWR.mockReturnValue({
        data: undefined,
        error: new Error("Failed to fetch asset history"),
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      // Get the fetcher function that was passed to SWR
      const fetcherFunction = mockSWR.mock.calls[0][1];

      // Test the fetcher function with error
      await expect(
        fetcherFunction("/api/assets/ASSET-001/history")
      ).rejects.toThrow("Network error");
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional fields gracefully", async () => {
      const incompleteData = [
        {
          newState: AssetState.AVAILABLE,
          changedBy: "user1",
          timestamp: "2024-01-15T10:30:00Z",
          // Missing userName and changeReason
        },
        {
          newState: AssetState.SIGNED_OUT,
          changedBy: "user2",
          timestamp: "2024-01-16T14:20:00Z",
          userName: "Jane Smith",
          // Missing changeReason
        },
      ];

      mockSWR.mockReturnValue({
        data: { data: incompleteData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Should still render without crashing
        expect(
          screen.getByText(ASSET_STATE_LABELS[AssetState.AVAILABLE])
        ).toBeInTheDocument();
        expect(
          screen.getByText(ASSET_STATE_LABELS[AssetState.SIGNED_OUT])
        ).toBeInTheDocument();
        expect(screen.getByText("By: Jane Smith")).toBeInTheDocument();
      });
    });

    it("handles invalid timestamp gracefully", async () => {
      const invalidTimestampData = [
        {
          newState: AssetState.AVAILABLE,
          changedBy: "user1",
          timestamp: "invalid-date",
          userName: "John Doe",
        },
      ];

      mockSWR.mockReturnValue({
        data: { data: invalidTimestampData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Should not crash, should show "Invalid Date" or similar
        expect(screen.getByText("By: John Doe")).toBeInTheDocument();
      });
    });

    it("handles unknown asset states gracefully", async () => {
      const unknownStateData = [
        {
          newState: "UNKNOWN_STATE" as AssetState,
          changedBy: "user1",
          timestamp: "2024-01-15T10:30:00Z",
          userName: "John Doe",
        },
      ];

      mockSWR.mockReturnValue({
        data: { data: unknownStateData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText("By: John Doe")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      const heading = screen.getByText("Asset History");
      expect(heading).toBeInTheDocument();
    });

    it("has proper list structure for history entries", async () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Check that history entries are properly structured
        const historyContainer = screen
          .getByText("Asset History")
          .closest("div");
        expect(historyContainer).toBeInTheDocument();
      });
    });

    it("provides meaningful text for screen readers", async () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      await waitFor(() => {
        // Check for meaningful content
        expect(screen.getByText("Asset History")).toBeInTheDocument();
        expect(screen.getByText("By: John Doe")).toBeInTheDocument();
        expect(
          screen.getByText("Asset assigned to employee")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Design", () => {
    it("has proper card layout with flex classes", () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      const card = screen.getByText("Asset History").closest('[class*="flex"]');
      expect(card).toBeInTheDocument();
    });

    it("has minimum height constraint", () => {
      mockSWR.mockReturnValue({
        data: { data: mockHistoryData },
        error: undefined,
        isLoading: false,
      });

      render(<AssetHistory assetNumber="ASSET-001" />);

      const card = screen
        .getByText("Asset History")
        .closest('[class*="min-h-[600px]"]');
      expect(card).toBeInTheDocument();
    });
  });
});
