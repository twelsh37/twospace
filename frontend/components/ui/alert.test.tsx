// frontend/components/ui/alert.test.tsx

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
import { render, screen } from "@testing-library/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  describe("Basic Rendering", () => {
    it("renders alert with default props", () => {
      render(<Alert>Test alert message</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Test alert message");
    });

    it("renders alert with custom className", () => {
      render(<Alert className="custom-alert">Custom Alert</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("custom-alert");
    });

    it("renders alert with variant classes", () => {
      render(<Alert variant="default">Default Alert</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border");
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      render(<Alert variant="default">Default Alert</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border");
    });

    it("renders destructive variant", () => {
      render(<Alert variant="destructive">Destructive Alert</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-destructive/50", "text-destructive");
    });
  });

  describe("AlertTitle", () => {
    it("renders alert title", () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          Alert description
        </Alert>
      );
      const title = screen.getByText("Alert Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("mb-1", "font-medium");
    });

    it("renders alert title with custom className", () => {
      render(
        <Alert>
          <AlertTitle className="custom-title">Custom Title</AlertTitle>
        </Alert>
      );
      const title = screen.getByText("Custom Title");
      expect(title).toHaveClass("custom-title");
    });
  });

  describe("AlertDescription", () => {
    it("renders alert description", () => {
      render(
        <Alert>
          <AlertDescription>Alert description text</AlertDescription>
        </Alert>
      );
      const description = screen.getByText("Alert description text");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm");
    });

    it("renders alert description with custom className", () => {
      render(
        <Alert>
          <AlertDescription className="custom-description">
            Custom Description
          </AlertDescription>
        </Alert>
      );
      const description = screen.getByText("Custom Description");
      expect(description).toHaveClass("custom-description");
    });
  });

  describe("Complex Alert Structure", () => {
    it("renders alert with both title and description", () => {
      render(
        <Alert>
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            This is an important message for users.
          </AlertDescription>
        </Alert>
      );

      const title = screen.getByText("Important Notice");
      const description = screen.getByText(
        "This is an important message for users."
      );

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it("renders destructive alert with title and description", () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      const title = screen.getByText("Error");
      const description = screen.getByText(
        "Something went wrong. Please try again."
      );

      expect(alert).toHaveClass("border-destructive/50", "text-destructive");
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper role attribute", () => {
      render(<Alert>Accessible Alert</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("supports aria attributes", () => {
      render(
        <Alert aria-label="Custom alert" aria-describedby="description">
          Alert content
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-label", "Custom alert");
      expect(alert).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty content", () => {
      render(<Alert></Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("handles null children", () => {
      render(<Alert>{null}</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("handles undefined children", () => {
      render(<Alert>{undefined}</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("handles complex nested content", () => {
      render(
        <Alert>
          <AlertTitle>
            <strong>Bold Title</strong>
          </AlertTitle>
          <AlertDescription>
            <span>Description with </span>
            <em>emphasis</em>
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Bold Title");
      expect(alert).toHaveTextContent("Description with emphasis");
    });
  });
});
