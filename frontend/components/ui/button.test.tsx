// frontend/components/ui/button.test.tsx

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
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  describe("Basic Rendering", () => {
    it("renders button with default props", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("bg-primary");
    });

    it("renders button with custom className", () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("renders button with id and name attributes", () => {
      render(
        <Button id="test-id" name="test-name">
          Test Button
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("id", "test-id");
      expect(button).toHaveAttribute("name", "test-name");
    });

    it("renders disabled button", () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      render(<Button variant="default">Default Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders destructive variant", () => {
      render(<Button variant="destructive">Destructive Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "text-white");
    });

    it("renders outline variant", () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "bg-background");
    });

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");
    });

    it("renders link variant", () => {
      render(<Button variant="link">Link Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-primary", "underline-offset-4");
    });
  });

  describe("Sizes", () => {
    it("renders default size", () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9", "px-4", "py-2");
    });

    it("renders small size", () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8", "px-3");
    });

    it("renders large size", () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "px-6");
    });

    it("renders icon size", () => {
      render(<Button size="icon">Icon Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });
  });

  describe("Interactions", () => {
    it("handles click events", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("handles disabled click events", () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("handles keyboard events", () => {
      const handleKeyDown = jest.fn();
      render(<Button onKeyDown={handleKeyDown}>Keyboard Button</Button>);
      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Enter" });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe("asChild Prop", () => {
    it("renders as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
      expect(link).toHaveClass("bg-primary");
    });

    it("renders as button when asChild is false", () => {
      render(<Button asChild={false}>Regular Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("Accessibility", () => {
    it("supports aria attributes", () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Accessible Button
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Custom label");
      expect(button).toHaveAttribute("aria-describedby", "description");
    });

    it("supports data attributes", () => {
      render(<Button data-testid="test-button">Data Button</Button>);
      const button = screen.getByTestId("test-button");
      expect(button).toBeInTheDocument();
    });

    it("has focus-visible styles", () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "focus-visible:border-ring",
        "focus-visible:ring-ring/50"
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children", () => {
      render(<Button></Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("handles null children", () => {
      render(<Button>{null}</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("handles undefined children", () => {
      render(<Button>{undefined}</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("handles complex children", () => {
      render(
        <Button>
          <span>Text</span>
          <strong>Bold</strong>
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("TextBold");
    });
  });
});
