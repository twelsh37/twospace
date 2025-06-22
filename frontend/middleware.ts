// frontend/middleware.ts
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
  const { searchParams } = request.nextUrl;
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
  matcher: "/assets/:path*",
};
