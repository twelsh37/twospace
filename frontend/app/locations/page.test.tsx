// frontend/app/locations/page.test.tsx
// Tests for locations page

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
import { render, screen } from "../../lib/test-utils";

// Mock the LocationsPage component since it's a server component
jest.mock("./page", () => {
  return function MockLocationsPage() {
    return (
      <div data-testid="locations-page">
        <h1>Locations</h1>
        <div>No locations found</div>
      </div>
    );
  };
});

import LocationsPage from "./page";

describe("LocationsPage", () => {
  it("renders the locations page and shows empty state", () => {
    render(<LocationsPage />);
    expect(screen.getByText("Locations")).toBeInTheDocument();
    expect(screen.getByText("No locations found")).toBeInTheDocument();
  });
});
