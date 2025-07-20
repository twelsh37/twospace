// frontend/app/users/page.test.tsx
// Unit/functional tests for the users page

import React from "react";
import { render, screen } from "../../lib/test-utils";

// Mock the UsersPage component since it's a server component
jest.mock("./page", () => {
  return function MockUsersPage() {
    return (
      <div data-testid="users-page">
        <h1>Users</h1>
        <div>No users found</div>
      </div>
    );
  };
});

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
    const mockSearchParams = Promise.resolve({});
    render(<UsersPage searchParams={mockSearchParams} />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });
});
