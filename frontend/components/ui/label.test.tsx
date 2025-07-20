// frontend/components/ui/label.test.tsx
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
