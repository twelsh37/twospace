// frontend/app/page.test.tsx
// Unit/functional tests for the HomePage

import React from "react";
import { render } from "../lib/test-utils";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import HomePage from "./page";
import { redirect } from "next/navigation";

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to dashboard", () => {
    render(<HomePage />);

    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
