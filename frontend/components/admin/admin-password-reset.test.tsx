// frontend/components/admin/admin-password-reset.test.tsx

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
import { AdminPasswordReset } from "./admin-password-reset";

// Mock the auth context
jest.mock("@/lib/auth-context", () => ({
  useAuth: jest.fn(() => ({
    session: { access_token: "mock-token" },
  })),
}));

// Mock the Supabase client
jest.mock("@/lib/supabase", () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => ({
        data: { session: { access_token: "mock-token" } },
      })),
    },
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe("AdminPasswordReset", () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the password reset form", () => {
    render(<AdminPasswordReset />);

    expect(screen.getByText("Reset User Password")).toBeInTheDocument();
    expect(screen.getByLabelText("User Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset Password" })
    ).toBeInTheDocument();
  });

  it("pre-fills email when userEmail prop is provided", () => {
    render(<AdminPasswordReset userEmail="test@example.com" />);

    const emailInput = screen.getByLabelText("User Email") as HTMLInputElement;
    expect(emailInput.value).toBe("test@example.com");
  });

  it("shows error when email is empty and form is submitted", async () => {
    render(<AdminPasswordReset />);

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("shows loading state during password reset", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, newPassword: "newPass123!" }),
    } as Response);

    render(<AdminPasswordReset userEmail="test@example.com" />);

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Resetting...")).toBeInTheDocument();
    });
  });

  it("shows success message with new password when reset succeeds", async () => {
    const newPassword = "newPass123!";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, newPassword }),
    } as Response);

    render(<AdminPasswordReset userEmail="test@example.com" />);

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password reset successfully!")
      ).toBeInTheDocument();
      expect(
        screen.getByText(`New Password: ${newPassword}`)
      ).toBeInTheDocument();
    });
  });

  it("shows error message when reset fails", async () => {
    const errorMessage = "User not found";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response);

    render(<AdminPasswordReset userEmail="test@example.com" />);

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("calls onSuccess callback when reset succeeds", async () => {
    const onSuccess = jest.fn();
    const newPassword = "newPass123!";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, newPassword }),
    } as Response);

    render(
      <AdminPasswordReset userEmail="test@example.com" onSuccess={onSuccess} />
    );

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(newPassword);
    });
  });

  it("calls onError callback when reset fails", async () => {
    const onError = jest.fn();
    const errorMessage = "User not found";

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response);

    render(
      <AdminPasswordReset userEmail="test@example.com" onError={onError} />
    );

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("disables form inputs during loading", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminPasswordReset userEmail="test@example.com" />);

    const emailInput = screen.getByLabelText("User Email");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
});
