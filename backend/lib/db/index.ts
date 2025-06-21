// backend/lib/db/index.ts
// Database connection setup for Drizzle ORM with Supabase
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Explicitly load variables from .env.local
dotenv.config({ path: ".env.local" });

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set in environment variables");
}

// Create the connection
// Note: For Supabase with Transaction pooling, disable prepare
const queryClient = postgres(process.env.POSTGRES_URL, {
  prepare: false, // Required for Supabase Transaction pooling
  max: isProduction ? 10 : 1, // Connection pool size
});

// Create Drizzle instance with schema
export const db = drizzle(queryClient, {
  schema,
  logger: !isProduction, // Enable logging in development
});

// Export schema and types for use in API routes
export * from "./schema";

// Helper function to close database connection (useful for serverless)
export async function closeConnection() {
  await queryClient.end();
}
