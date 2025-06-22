// frontend/lib/config.ts
// Centralized configuration for the application.

import * as dotenv from "dotenv";

// Explicitly load .env.local to ensure variables are available server-side,
// especially in environments where Next.js's default loading might be inconsistent.
dotenv.config({ path: ".env.local" });

/**
 * Retrieves the base URL for the backend API from environment variables.
 * This function-based approach ensures that process.env is accessed at runtime,
 * avoiding build-time or module-caching issues.
 *
 * @returns {string} The base URL for the API.
 * @throws {Error} If the environment variable is not set.
 */
export function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    // This check is important for ensuring the app doesn't run
    // without its necessary configuration.
    console.error("FATAL: NEXT_PUBLIC_API_URL is not set.");
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set in the environment variables."
    );
  }

  return apiBaseUrl;
}
