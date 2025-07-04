// frontend/app/locations/page.test.tsx
// Unit/functional tests for the locations page

import React from "react";
import { render, screen, waitFor } from "../../lib/test-utils";
import LocationsPage from "./page";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [], // Return empty array for no locations
  });
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("LocationsPage", () => {
  it("renders the locations page and shows empty state", async () => {
    render(<LocationsPage />);
    expect(screen.getAllByText(/Locations/i).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.getByText(/No locations found/i)).toBeInTheDocument()
    );
  });
});
