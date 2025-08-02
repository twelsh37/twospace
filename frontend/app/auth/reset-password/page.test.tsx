// frontend/app/auth/reset-password/page.test.tsx

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "./page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

// Mock Supabase client
jest.mock("@/lib/supabase", () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => ({
        data: { session: null },
      })),
      setSession: jest.fn(() => ({ error: null })),
      updateUser: jest.fn(() => ({ error: null })),
    },
  })),
}));

// Mock the password strength indicator
jest.mock("@/components/ui/password-strength-indicator", () => ({
  PasswordStrengthIndicator: ({ password }: { password: string }) => (
    <div data-testid="password-strength-indicator">
      {password ? "Strength indicator" : null}
    </div>
  ),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the password reset form", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update Password" })
    ).toBeInTheDocument();
  });

  it("shows password strength indicator when password is entered", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    fireEvent.change(passwordInput, { target: { value: "test" } });

    expect(
      screen.getByTestId("password-strength-indicator")
    ).toBeInTheDocument();
  });

  it("shows password match indicator when confirm password is entered", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmInput = screen.getByLabelText("Confirm New Password");

    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

    expect(screen.getByText("Passwords match")).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });

    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "DifferentPass123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows error when password is invalid", async () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });

    fireEvent.change(passwordInput, { target: { value: "weak" } });
    fireEvent.change(confirmInput, { target: { value: "weak" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password does not meet requirements")
      ).toBeInTheDocument();
    });
  });

  it("toggles password visibility", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText(
      "New Password"
    ) as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector("button");

    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleButton!);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButton!);
    expect(passwordInput.type).toBe("password");
  });

  it("toggles confirm password visibility", () => {
    render(<ResetPasswordPage />);

    const confirmInput = screen.getByLabelText(
      "Confirm New Password"
    ) as HTMLInputElement;
    const toggleButton = confirmInput.parentElement?.querySelector("button");

    expect(confirmInput.type).toBe("password");

    fireEvent.click(toggleButton!);
    expect(confirmInput.type).toBe("text");

    fireEvent.click(toggleButton!);
    expect(confirmInput.type).toBe("password");
  });

  it("disables submit button when form is invalid", () => {
    render(<ResetPasswordPage />);

    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when form is valid", () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });

    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

    expect(submitButton).not.toBeDisabled();
  });
});
