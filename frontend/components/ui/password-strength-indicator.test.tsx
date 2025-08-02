// frontend/components/ui/password-strength-indicator.test.tsx

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
import { render, screen } from "@testing-library/react";
import { PasswordStrengthIndicator } from "./password-strength-indicator";

describe("PasswordStrengthIndicator", () => {
  it("should not render when password is empty", () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render strength bar and text for valid password", () => {
    render(<PasswordStrengthIndicator password="StrongPass123!" />);

    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.getByText("Password Requirements:")).toBeInTheDocument();
  });

  it("should show all requirements as met for strong password", () => {
    render(<PasswordStrengthIndicator password="StrongPass123!" />);

    expect(screen.getByText("At least 12 characters")).toBeInTheDocument();
    expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("One lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("One number")).toBeInTheDocument();
    expect(screen.getByText("One special character")).toBeInTheDocument();
  });

  it("should show error messages for invalid password", () => {
    render(<PasswordStrengthIndicator password="weak" />);

    expect(
      screen.getByText("Password must be at least 12 characters long")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must contain at least one uppercase letter")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must contain at least one lowercase letter")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must contain at least one number")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must contain at least one special character")
    ).toBeInTheDocument();
  });

  it("should hide requirements when showRequirements is false", () => {
    render(
      <PasswordStrengthIndicator
        password="StrongPass123!"
        showRequirements={false}
      />
    );

    expect(
      screen.queryByText("Password Requirements:")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("At least 12 characters")
    ).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <PasswordStrengthIndicator
        password="StrongPass123!"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should show different strength levels", () => {
    const { rerender } = render(
      <PasswordStrengthIndicator password="WeakPass1!" />
    );
    expect(screen.getByText("Weak")).toBeInTheDocument();

    rerender(<PasswordStrengthIndicator password="FairPassword123!" />);
    expect(screen.getByText("Fair")).toBeInTheDocument();

    rerender(<PasswordStrengthIndicator password="GoodPassword123!" />);
    expect(screen.getByText("Good")).toBeInTheDocument();

    rerender(<PasswordStrengthIndicator password="VeryStrongPassword123!" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });
});
