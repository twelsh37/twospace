// frontend/app/slides/page.test.tsx
import { render, screen } from "@testing-library/react";
import SlidesPage from "./page";

// Mock the UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ ...props }: React.ComponentProps<'div'>) => <div {...props} />,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  Play: () => <span>Play</span>,
  Pause: () => <span>Pause</span>,
}));

describe("SlidesPage", () => {
  it("renders the first slide with correct title", () => {
    render(<SlidesPage />);

    expect(
      screen.getByText("Building an Asset Management System")
    ).toBeInTheDocument();
    expect(
      screen.getByText("An AI-Driven Development Journey with Cursor IDE")
    ).toBeInTheDocument();
  });

  it("shows slide counter", () => {
    render(<SlidesPage />);

    expect(screen.getByText("1 / 11")).toBeInTheDocument();
  });

  it("has navigation buttons", () => {
    render(<SlidesPage />);

    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("has auto-play toggle button", () => {
    render(<SlidesPage />);

    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("displays the showcase title in header", () => {
    render(<SlidesPage />);

    expect(
      screen.getByText("AI-Driven Development Showcase")
    ).toBeInTheDocument();
  });
});
