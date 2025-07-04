// frontend/app/users/page.test.tsx
// Unit/functional tests for the users page

import React from "react";
import { render, screen, waitFor } from "../../lib/test-utils";
import UsersPage from "./page";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [], // Return empty array for no users
  });
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("UsersPage", () => {
  it("renders the users page and shows empty state", async () => {
    render(<UsersPage />);
    expect(screen.getAllByText(/Users/i).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.getByText(/No users found/i)).toBeInTheDocument()
    );
  });
});
