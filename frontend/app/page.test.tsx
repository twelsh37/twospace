// frontend/app/page.test.tsx
// Unit/functional tests for the HomePage

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
    // Call the component function directly since it doesn't return JSX
    HomePage();

    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
