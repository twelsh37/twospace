// frontend/middleware.ts

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

// This middleware intercepts requests to specified paths to clean up search parameters.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// A whitelist of allowed search parameters for the /assets route.
// This prevents internal or unexpected parameters from causing errors.
const ALLOWED_ASSET_PARAMS = [
  "page",
  "limit",
  "type",
  "state",
  "assignmentType",
  "status", // Add this line to allow status param
];

/**
 * Intercepts the request to clean up search parameters. It only allows
 * parameters from a specific whitelist to pass through, discarding any others.
 *
 * @param {NextRequest} request The incoming request.
 * @returns {NextResponse} A response that either redirects to a cleaned URL
 * or continues to the requested path.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Rewrite root path to /dashboard
  if (pathname === "/") {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.rewrite(dashboardUrl);
  }

  const newSearchParams = new URLSearchParams();
  let paramsChanged = false;

  // Copy only whitelisted search params
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_ASSET_PARAMS.includes(key)) {
      newSearchParams.set(key, value);
    }
  }

  // If the new search string is different, it means we removed some params.
  if (newSearchParams.toString() !== searchParams.toString()) {
    paramsChanged = true;
  }

  // If we found and removed any disallowed params, redirect to the clean URL
  if (paramsChanged) {
    const newUrl = request.nextUrl.clone();
    newUrl.search = newSearchParams.toString();
    return NextResponse.redirect(newUrl);
  }

  // Otherwise, continue without any changes
  return NextResponse.next();
}

// This config specifies that the middleware should only run on the /assets path
// and any sub-paths.
export const config = {
  matcher: ["/", "/assets/:path*"],
};
