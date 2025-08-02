// frontend/app/api/admin/reset-password/route.test.ts

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock Supabase client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      admin: {
        updateUserById: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}));

describe("/api/admin/reset-password", () => {
  const mockRequest = (body: unknown, headers?: Record<string, string>) => {
    return new NextRequest("http://localhost:3000/api/admin/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when no authorization header is provided", async () => {
    const request = mockRequest({ email: "test@example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Missing or invalid authorization header");
  });

  it("should return 401 when authorization header is invalid", async () => {
    const request = mockRequest(
      { email: "test@example.com" },
      { authorization: "InvalidToken" }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Missing or invalid authorization header");
  });

  it("should return 400 when email is missing", async () => {
    const request = mockRequest({}, { authorization: "Bearer valid-token" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("should return 400 when email is empty", async () => {
    const request = mockRequest(
      { email: "" },
      { authorization: "Bearer valid-token" }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  // Note: Additional tests would require mocking the Supabase client responses
  // These tests demonstrate the basic structure and error handling
});
