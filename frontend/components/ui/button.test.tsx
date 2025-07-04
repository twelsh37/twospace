// frontend/components/ui/button.test.tsx
// Unit/functional tests for the Button component

import React from "react";
import { render, screen, fireEvent } from "../../lib/test-utils";
import { Button } from "./button";

describe("Button", () => {
  it("renders button with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("renders button with custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole("button", { name: "Custom Button" });
    expect(button).toHaveClass("custom-class");
  });

  it("renders all button variants correctly", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border", "bg-background");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "text-primary",
      "underline-offset-4"
    );
  });

  it("renders all button sizes correctly", () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9", "px-4");

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-8", "px-3");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10", "px-6");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-9");
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("renders with icon and text", () => {
    render(
      <Button>
        <span>Icon</span>
        <svg data-testid="icon" />
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("gap-2");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("applies focus styles correctly", () => {
    render(<Button>Focusable</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "focus-visible:ring-ring/50",
      "focus-visible:ring-[3px]"
    );
  });

  it("handles aria-invalid state", () => {
    render(<Button aria-invalid="true">Invalid</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-invalid", "true");
    expect(button).toHaveClass("aria-invalid:ring-destructive/20");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders with data-slot attribute", () => {
    render(<Button>Slot Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("combines variant and size classes correctly", () => {
    render(
      <Button variant="destructive" size="lg">
        Large Destructive
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive", "h-10", "px-6");
  });

  it("handles type attribute", () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("handles form attributes", () => {
    render(<Button form="test-form">Form Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("form", "test-form");
  });
});
