// frontend/components/ui/card.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";

describe("Card Components", () => {
  describe("Card", () => {
    it("renders card with default props", () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText("Card content");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "bg-card",
        "text-card-foreground",
        "rounded-xl",
        "border"
      );
    });

    it("renders card with custom className", () => {
      render(<Card className="custom-card">Custom Card</Card>);
      const card = screen.getByText("Custom Card");
      expect(card).toHaveClass("custom-card");
    });

    it("renders card with data attributes", () => {
      render(<Card data-testid="test-card">Test Card</Card>);
      const card = screen.getByTestId("test-card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
    });

    it("handles complex children", () => {
      render(
        <Card>
          <div>Header</div>
          <p>Content</p>
          <span>Footer</span>
        </Card>
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    it("handles empty children", () => {
      render(<Card></Card>);
      const card = document.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe("CardHeader", () => {
    it("renders card header with default props", () => {
      render(<CardHeader>Header content</CardHeader>);
      const header = screen.getByText("Header content");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        "grid",
        "auto-rows-min",
        "grid-rows-[auto_auto]"
      );
    });

    it("renders card header with custom className", () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>);
      const header = screen.getByText("Custom Header");
      expect(header).toHaveClass("custom-header");
    });

    it("renders card header with data attributes", () => {
      render(<CardHeader data-testid="test-header">Test Header</CardHeader>);
      const header = screen.getByTestId("test-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("data-slot", "card-header");
    });

    it("handles complex layout with action", () => {
      render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });

  describe("CardTitle", () => {
    it("renders card title with default props", () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText("Card Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("leading-none", "font-semibold");
    });

    it("renders card title with custom className", () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>);
      const title = screen.getByText("Custom Title");
      expect(title).toHaveClass("custom-title");
    });

    it("renders card title with data attributes", () => {
      render(<CardTitle data-testid="test-title">Test Title</CardTitle>);
      const title = screen.getByTestId("test-title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("data-slot", "card-title");
    });

    it("handles long title text", () => {
      const longTitle =
        "This is a very long title that should be handled gracefully by the card title component";
      render(<CardTitle>{longTitle}</CardTitle>);
      const title = screen.getByText(longTitle);
      expect(title).toBeInTheDocument();
    });
  });

  describe("CardDescription", () => {
    it("renders card description with default props", () => {
      render(<CardDescription>Card Description</CardDescription>);
      const description = screen.getByText("Card Description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-muted-foreground", "text-sm");
    });

    it("renders card description with custom className", () => {
      render(
        <CardDescription className="custom-desc">
          Custom Description
        </CardDescription>
      );
      const description = screen.getByText("Custom Description");
      expect(description).toHaveClass("custom-desc");
    });

    it("renders card description with data attributes", () => {
      render(
        <CardDescription data-testid="test-desc">
          Test Description
        </CardDescription>
      );
      const description = screen.getByTestId("test-desc");
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute("data-slot", "card-description");
    });

    it("handles HTML content", () => {
      render(
        <CardDescription>
          <strong>Bold</strong> and <em>italic</em> text
        </CardDescription>
      );
      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("italic")).toBeInTheDocument();
    });
  });

  describe("CardAction", () => {
    it("renders card action with default props", () => {
      render(<CardAction>Card Action</CardAction>);
      const action = screen.getByText("Card Action");
      expect(action).toBeInTheDocument();
      expect(action).toHaveClass("col-start-2", "row-span-2", "row-start-1");
    });

    it("renders card action with custom className", () => {
      render(<CardAction className="custom-action">Custom Action</CardAction>);
      const action = screen.getByText("Custom Action");
      expect(action).toHaveClass("custom-action");
    });

    it("renders card action with data attributes", () => {
      render(<CardAction data-testid="test-action">Test Action</CardAction>);
      const action = screen.getByTestId("test-action");
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute("data-slot", "card-action");
    });

    it("handles button content", () => {
      render(
        <CardAction>
          <button>Click me</button>
        </CardAction>
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
    });
  });

  describe("CardContent", () => {
    it("renders card content with default props", () => {
      render(<CardContent>Card Content</CardContent>);
      const content = screen.getByText("Card Content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("px-6");
    });

    it("renders card content with custom className", () => {
      render(
        <CardContent className="custom-content">Custom Content</CardContent>
      );
      const content = screen.getByText("Custom Content");
      expect(content).toHaveClass("custom-content");
    });

    it("renders card content with data attributes", () => {
      render(
        <CardContent data-testid="test-content">Test Content</CardContent>
      );
      const content = screen.getByTestId("test-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-slot", "card-content");
    });

    it("handles complex content structure", () => {
      render(
        <CardContent>
          <h3>Section Title</h3>
          <p>Paragraph content</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </CardContent>
      );
      expect(screen.getByText("Section Title")).toBeInTheDocument();
      expect(screen.getByText("Paragraph content")).toBeInTheDocument();
      expect(screen.getByText("List item 1")).toBeInTheDocument();
      expect(screen.getByText("List item 2")).toBeInTheDocument();
    });
  });

  describe("CardFooter", () => {
    it("renders card footer with default props", () => {
      render(<CardFooter>Card Footer</CardFooter>);
      const footer = screen.getByText("Card Footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("flex", "items-center", "px-6");
    });

    it("renders card footer with custom className", () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>);
      const footer = screen.getByText("Custom Footer");
      expect(footer).toHaveClass("custom-footer");
    });

    it("renders card footer with data attributes", () => {
      render(<CardFooter data-testid="test-footer">Test Footer</CardFooter>);
      const footer = screen.getByTestId("test-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute("data-slot", "card-footer");
    });

    it("handles multiple footer items", () => {
      render(
        <CardFooter>
          <span>Left item</span>
          <span>Center item</span>
          <span>Right item</span>
        </CardFooter>
      );
      expect(screen.getByText("Left item")).toBeInTheDocument();
      expect(screen.getByText("Center item")).toBeInTheDocument();
      expect(screen.getByText("Right item")).toBeInTheDocument();
    });
  });

  describe("Complete Card Structure", () => {
    it("renders complete card with all components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <span>Footer content</span>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText("Complete Card")).toBeInTheDocument();
      expect(
        screen.getByText("This is a complete card example")
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(
        screen.getByText("This is the main content of the card.")
      ).toBeInTheDocument();
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("handles card with only header and content", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
            <CardDescription>Simple description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Simple content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText("Simple Card")).toBeInTheDocument();
      expect(screen.getByText("Simple description")).toBeInTheDocument();
      expect(screen.getByText("Simple content")).toBeInTheDocument();
    });

    it("handles card with only content", () => {
      render(
        <Card>
          <CardContent>
            <p>Content only card</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText("Content only card")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("supports aria attributes on card", () => {
      render(
        <Card aria-label="Test card" aria-describedby="card-desc">
          <CardContent>Accessible card</CardContent>
        </Card>
      );
      const card = screen.getByText("Accessible card").parentElement;
      expect(card).toHaveAttribute("aria-label", "Test card");
      expect(card).toHaveAttribute("aria-describedby", "card-desc");
    });

    it("supports role attributes", () => {
      render(
        <Card role="article">
          <CardContent>Article card</CardContent>
        </Card>
      );
      const card = screen.getByRole("article");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null children", () => {
      render(<Card>{null}</Card>);
      const card = document.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it("handles undefined children", () => {
      render(<Card>{undefined}</Card>);
      const card = document.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it("handles very long content", () => {
      const longContent = "a".repeat(1000);
      render(
        <Card>
          <CardContent>{longContent}</CardContent>
        </Card>
      );
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it("handles special characters in content", () => {
      render(
        <Card>
          <CardContent>
            <p>Special chars: &lt;&gt;&amp;&quot;&apos;</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText("Special chars: <>&\"'")).toBeInTheDocument();
    });
  });
});
