// frontend/components/ui/label.test.tsx

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

// Unit tests for Label component

import React from "react";
import { render, screen } from "../../lib/test-utils";
import { Label } from "./label";

describe("Label", () => {
  it("renders label with text content", () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders label with htmlFor attribute", () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("renders label with custom className", () => {
    render(<Label className="custom-class">Test Label</Label>);
    const label = screen.getByText("Test Label");
    expect(label).toHaveClass("custom-class");
  });

  it("renders label with asChild prop", () => {
    render(
      <Label asChild>
        <span data-testid="custom-label">Test Label</span>
      </Label>
    );
    expect(screen.getByTestId("custom-label")).toBeInTheDocument();
  });

  it("renders label with disabled state", () => {
    render(<Label disabled>Test Label</Label>);
    const label = screen.getByText("Test Label");
    expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
  });

  it("renders label with required indicator", () => {
    render(<Label required>Test Label</Label>);
    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Test Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it("renders label with data attributes", () => {
    render(<Label data-testid="test-label">Test Label</Label>);
    expect(screen.getByTestId("test-label")).toBeInTheDocument();
  });

  it("renders label with aria attributes", () => {
    render(
      <Label aria-describedby="description" aria-label="Test label">
        Test Label
      </Label>
    );
    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("aria-describedby", "description");
    expect(label).toHaveAttribute("aria-label", "Test label");
  });
});
