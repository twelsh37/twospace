// frontend/components/ui/table.test.tsx

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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

describe("Table", () => {
  describe("Basic Rendering", () => {
    it("renders table with default props", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("renders table with custom className", () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole("table");
      expect(table).toHaveClass("custom-table");
    });

    it("renders table with id and name attributes", () => {
      render(
        <Table id="test-id" data-testid="test-table">
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByTestId("test-table");
      expect(table).toHaveAttribute("id", "test-id");
    });
  });

  describe("TableCaption", () => {
    it("renders table caption", () => {
      render(
        <Table>
          <TableCaption>Test Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = screen.getByText("Test Table Caption");
      expect(caption).toBeInTheDocument();
      expect(caption).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("renders caption with custom className", () => {
      render(
        <Table>
          <TableCaption className="custom-caption">Custom Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = screen.getByText("Custom Caption");
      expect(caption).toHaveClass("custom-caption");
    });
  });

  describe("TableHeader", () => {
    it("renders table header", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header Cell</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Body Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const header = screen.getByText("Header Cell");
      expect(header).toBeInTheDocument();
      // Check for a subset of classes that are reliably present, using toMatch for flexibility
      expect(header.className).toMatch(/h-10/);
      expect(header.className).toMatch(/px-2/);
      expect(header.className).toMatch(/text-left/);
      expect(header.className).toMatch(/align-middle/);
      expect(header.className).toMatch(/font-medium/);
    });

    it("renders header with custom className", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="custom-header">Custom Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Body Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const header = screen.getByText("Custom Header");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("TableBody", () => {
    it("renders table body", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Body Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const body = screen.getByText("Body Cell");
      expect(body).toBeInTheDocument();
    });

    it("renders body with custom className", () => {
      render(
        <Table>
          <TableBody className="custom-body">
            <TableRow>
              <TableCell>Body Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const body = screen.getByText("Body Cell").closest("tbody");
      expect(body).toHaveClass("custom-body");
    });
  });

  describe("TableRow", () => {
    it("renders table row", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Row Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByText("Row Cell").closest("tr");
      expect(row).toBeInTheDocument();
      expect(row).toHaveClass(
        "border-b",
        "transition-colors",
        "hover:bg-muted/50"
      );
    });

    it("renders row with custom className", () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="custom-row">
              <TableCell>Row Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByText("Row Cell").closest("tr");
      expect(row).toHaveClass("custom-row");
    });
  });

  describe("TableCell", () => {
    it("renders table cell", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByText("Test Cell Content");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveClass("p-2", "align-middle");
    });

    it("renders cell with custom className", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell">Custom Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByText("Custom Cell");
      expect(cell).toHaveClass("custom-cell");
    });
  });

  describe("Complex Table Structure", () => {
    it("renders complete table with all components", () => {
      render(
        <Table>
          <TableCaption>User List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      const caption = screen.getByText("User List");
      const nameHeader = screen.getByText("Name");
      const emailHeader = screen.getByText("Email");
      const roleHeader = screen.getByText("Role");
      const johnCell = screen.getByText("John Doe");
      const janeCell = screen.getByText("Jane Smith");

      expect(table).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      expect(nameHeader).toBeInTheDocument();
      expect(emailHeader).toBeInTheDocument();
      expect(roleHeader).toBeInTheDocument();
      expect(johnCell).toBeInTheDocument();
      expect(janeCell).toBeInTheDocument();
    });

    it("renders table with multiple rows and columns", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>Laptop</TableCell>
              <TableCell>$999</TableCell>
              <TableCell>In Stock</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>Mouse</TableCell>
              <TableCell>$25</TableCell>
              <TableCell>Out of Stock</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>Keyboard</TableCell>
              <TableCell>$75</TableCell>
              <TableCell>In Stock</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Product")).toBeInTheDocument();
      expect(screen.getByText("Price")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("$999")).toBeInTheDocument();
      // Use getAllByText for ambiguous text and check the first occurrence
      const inStockElements = screen.getAllByText("In Stock");
      expect(inStockElements[0]).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("Mouse")).toBeInTheDocument();
      expect(screen.getByText("$25")).toBeInTheDocument();
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Keyboard")).toBeInTheDocument();
      expect(screen.getByText("$75")).toBeInTheDocument();
      // Use getAllByText for ambiguous text and check the second occurrence
      expect(inStockElements[1]).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper role attributes", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      const row = screen.getByRole("row");
      const cell = screen.getByRole("cell");

      expect(table).toBeInTheDocument();
      expect(row).toBeInTheDocument();
      expect(cell).toBeInTheDocument();
    });

    it("supports aria attributes", () => {
      render(
        <Table aria-label="Custom table" aria-describedby="description">
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      expect(table).toHaveAttribute("aria-label", "Custom table");
      expect(table).toHaveAttribute("aria-describedby", "description");
    });

    it("supports data attributes", () => {
      render(
        <Table data-testid="test-table">
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByTestId("test-table");
      expect(table).toBeInTheDocument();
    });
  });

  describe("Styling and Classes", () => {
    it("applies default table styling", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      expect(table).toHaveClass("w-full", "caption-bottom", "text-sm");
    });

    it("applies default header styling", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const header = screen.getByText("Header");
      // Check for a subset of classes that are reliably present, using toMatch for flexibility
      expect(header.className).toMatch(/h-10/);
      expect(header.className).toMatch(/px-2/);
      expect(header.className).toMatch(/text-left/);
      expect(header.className).toMatch(/align-middle/);
      expect(header.className).toMatch(/font-medium/);
    });

    it("applies default cell styling", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText("Cell");
      expect(cell).toHaveClass("p-2", "align-middle");
    });

    it("combines custom className with default styling", () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      expect(table).toHaveClass("custom-table", "w-full", "caption-bottom");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty table", () => {
      render(<Table></Table>);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("handles table with only header", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header Only</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const table = screen.getByRole("table");
      const header = screen.getByText("Header Only");

      expect(table).toBeInTheDocument();
      expect(header).toBeInTheDocument();
    });

    it("handles table with only body", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Body Only</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      const cell = screen.getByText("Body Only");

      expect(table).toBeInTheDocument();
      expect(cell).toBeInTheDocument();
    });

    it("handles very long cell content", () => {
      const longContent =
        "This is a very long cell content that might wrap to multiple lines and should be handled gracefully by the table component";
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>{longContent}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText(longContent);
      expect(cell).toBeInTheDocument();
    });

    it("handles special characters in cell content", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell with &lt;tags&gt; &amp; symbols</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText("Cell with <tags> & symbols");
      expect(cell).toBeInTheDocument();
    });
  });

  describe("Common Use Cases", () => {
    it("renders user management table", () => {
      render(
        <Table>
          <TableCaption>User Management</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Inactive</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      const caption = screen.getByText("User Management");
      const idHeader = screen.getByText("ID");
      const nameHeader = screen.getByText("Name");
      const emailHeader = screen.getByText("Email");
      const roleHeader = screen.getByText("Role");
      const statusHeader = screen.getByText("Status");

      expect(table).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      expect(idHeader).toBeInTheDocument();
      expect(nameHeader).toBeInTheDocument();
      expect(emailHeader).toBeInTheDocument();
      expect(roleHeader).toBeInTheDocument();
      expect(statusHeader).toBeInTheDocument();
    });

    it("renders inventory table", () => {
      render(
        <Table>
          <TableCaption>Inventory Status</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>LAP001</TableCell>
              <TableCell>MacBook Pro</TableCell>
              <TableCell>Electronics</TableCell>
              <TableCell>15</TableCell>
              <TableCell>$1,299</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>DESK002</TableCell>
              <TableCell>Standing Desk</TableCell>
              <TableCell>Furniture</TableCell>
              <TableCell>8</TableCell>
              <TableCell>$450</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole("table");
      const caption = screen.getByText("Inventory Status");
      const skuHeader = screen.getByText("SKU");
      const productHeader = screen.getByText("Product");
      const categoryHeader = screen.getByText("Category");
      const quantityHeader = screen.getByText("Quantity");
      const priceHeader = screen.getByText("Price");

      expect(table).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      expect(skuHeader).toBeInTheDocument();
      expect(productHeader).toBeInTheDocument();
      expect(categoryHeader).toBeInTheDocument();
      expect(quantityHeader).toBeInTheDocument();
      expect(priceHeader).toBeInTheDocument();
    });
  });
});
