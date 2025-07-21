// frontend/components/ui/input.test.tsx

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

// Unit tests for Input component

import React from "react";
import { render, screen, fireEvent } from "../../lib/test-utils";
import { Input } from "./input";

describe("Input", () => {
  it("renders input with default props", () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders input with custom type", () => {
    render(<Input type="email" data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("type", "email");
  });

  it("renders input with placeholder", () => {
    render(<Input placeholder="Enter text" data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("renders input with value", () => {
    render(<Input value="test value" data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveValue("test value");
  });

  it("handles onChange events", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} data-testid="test-input" />);
    const input = screen.getByTestId("test-input");

    fireEvent.change(input, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders disabled input", () => {
    render(<Input disabled data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toBeDisabled();
  });

  it("renders input with custom className", () => {
    render(<Input className="custom-class" data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveClass("custom-class");
  });

  it("renders input with id", () => {
    render(<Input id="test-id" data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("id", "test-id");
  });

  it("renders input with name", () => {
    render(<Input name="test-name" data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("name", "test-name");
  });

  it("renders input with required attribute", () => {
    render(<Input required data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input).toBeRequired();
  });

  it("renders input with aria attributes", () => {
    render(
      <Input
        aria-label="Test input"
        aria-describedby="description"
        data-testid="test-input"
      />
    );
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("aria-label", "Test input");
    expect(input).toHaveAttribute("aria-describedby", "description");
  });
});
