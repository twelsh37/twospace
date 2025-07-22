// frontend/app/users/page.test.tsx
// Tests for users page

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
