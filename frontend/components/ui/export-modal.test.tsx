// frontend/components/ui/export-modal.test.tsx

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
import { ExportModal } from "./export-modal";

// Mock the dialog components
jest.mock("./dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

// Mock the button component
jest.mock("./button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button data-testid="export-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe("ExportModal", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toHaveTextContent(
      "Export Report"
    );
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        title="Export Users"
      />
    );

    expect(screen.getByTestId("dialog-title")).toHaveTextContent(
      "Export Users"
    );
  });

  it("shows both CSV and PDF options when pdfOnly is false", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        pdfOnly={false}
      />
    );

    expect(screen.getByText("CSV (Excel compatible)")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("shows only PDF option when pdfOnly is true", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        pdfOnly={true}
      />
    );

    expect(
      screen.queryByText("CSV (Excel compatible)")
    ).not.toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("defaults to CSV when pdfOnly is false", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        pdfOnly={false}
      />
    );

    const csvRadio = screen.getByDisplayValue("csv");
    const pdfRadio = screen.getByDisplayValue("pdf");

    expect(csvRadio).toBeChecked();
    expect(pdfRadio).not.toBeChecked();
    expect(screen.getByTestId("export-button")).toHaveTextContent(
      "Export as CSV"
    );
  });

  it("defaults to PDF when pdfOnly is true", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        pdfOnly={true}
      />
    );

    const pdfRadio = screen.getByDisplayValue("pdf");
    expect(pdfRadio).toBeChecked();
    expect(screen.getByTestId("export-button")).toHaveTextContent(
      "Export as PDF"
    );
  });

  it("calls onExport with selected format when export button is clicked", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        pdfOnly={false}
      />
    );

    const exportButton = screen.getByTestId("export-button");
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledWith("csv");
  });

  it("changes format when radio buttons are clicked", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        pdfOnly={false}
      />
    );

    const pdfRadio = screen.getByDisplayValue("pdf");
    fireEvent.click(pdfRadio);

    expect(pdfRadio).toBeChecked();
    expect(screen.getByTestId("export-button")).toHaveTextContent(
      "Export as PDF"
    );
  });

  it("disables export button when loading", () => {
    render(
      <ExportModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
        loading={true}
      />
    );

    const exportButton = screen.getByTestId("export-button");
    expect(exportButton).toBeDisabled();
  });

  it("does not render when open is false", () => {
    render(
      <ExportModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });
});
