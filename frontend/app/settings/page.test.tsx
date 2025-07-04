// frontend/app/settings/page.test.tsx
// Unit and functional tests for SettingsPage

import React from "react";
import { render, screen, fireEvent, waitFor } from "../../lib/test-utils";
import SettingsPage from "./page";

// Mock fetch for settings API
beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url, options) => {
    if (options && options.method === "PUT") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reportCacheDuration: 60 }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          reportCacheDuration: 30,
          depreciationSettings: {
            method: "straight",
            years: 4,
            decliningPercents: [50, 25, 12.5, 12.5],
          },
        }),
    });
  });
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("SettingsPage", () => {
  it("renders settings page and loads initial values", async () => {
    render(<SettingsPage />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Reporting")).toBeInTheDocument()
    );
    expect(
      screen.getByLabelText("Report Cache Duration (minutes):")
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByDisplayValue("30")).toBeInTheDocument()
    );
  });

  it("allows changing and saving cache duration", async () => {
    render(<SettingsPage />);
    await waitFor(() =>
      expect(screen.getByDisplayValue("30")).toBeInTheDocument()
    );
    const input = screen.getByLabelText("Report Cache Duration (minutes):");
    fireEvent.change(input, { target: { value: "60" } });
    expect(input).toHaveValue(60);
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    await waitFor(() =>
      expect(screen.getByText("Settings saved!")).toBeInTheDocument()
    );
  });

  it("shows depreciation settings and allows changing method", async () => {
    render(<SettingsPage />);
    await waitFor(() =>
      expect(screen.getByText("Depreciation")).toBeInTheDocument()
    );
    const methodSelect = screen.getByLabelText("Depreciation Method:");
    fireEvent.change(methodSelect, { target: { value: "declining" } });
    expect(methodSelect).toHaveValue("declining");
    expect(screen.getByText("Total: 100.00%")).toBeInTheDocument();
  });

  it("shows warning if declining percents do not total 100", async () => {
    render(<SettingsPage />);
    await waitFor(() =>
      expect(screen.getByText("Depreciation")).toBeInTheDocument()
    );
    const methodSelect = screen.getByLabelText("Depreciation Method:");
    fireEvent.change(methodSelect, { target: { value: "declining" } });
    // Now we can use getByLabelText since we have proper label associations
    const year1Input = screen.getByLabelText("Year 1:");
    fireEvent.change(year1Input, { target: { value: "10" } });
    expect(screen.getByText(/Should total 100%/)).toBeInTheDocument();
  });
});
