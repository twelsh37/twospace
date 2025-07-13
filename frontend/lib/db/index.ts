// frontend/lib/db/index.ts
// Database connection setup for Drizzle ORM with Neon Postgres
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { systemLogger } from "@/lib/logger";

// Explicitly load variables from .env.local
dotenv.config({ path: ".env.local" });

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.POSTGRES_URL) {
  systemLogger.error("POSTGRES_URL is not set in environment variables");
  throw new Error("POSTGRES_URL is not set in environment variables");
}

// Declare queryClient for use in drizzle and closeConnection
let queryClient: ReturnType<typeof postgres>;

// Create the connection
try {
  // Log DB connection attempt
  systemLogger.info("Attempting to connect to Postgres database...");
  // Note: For Supabase with Transaction pooling, disable prepare
  queryClient = postgres(process.env.POSTGRES_URL, {
    prepare: false, // Required for Supabase Transaction pooling
    max: isProduction ? 10 : 5, // Allow more connections in development
  });
  systemLogger.info("Postgres database connection established successfully.");
} catch (err) {
  systemLogger.error(
    `Failed to connect to Postgres database: ${
      err instanceof Error ? err.stack : String(err)
    }`
  );
  throw err;
}

// Create Drizzle instance with schema
export const db = drizzle(queryClient, {
  schema,
  logger: !isProduction, // Enable logging in development
});

// Export schema and types for use in API routes
export * from "./schema";

// Helper function to close database connection (useful for serverless)
export async function closeConnection() {
  try {
    await queryClient.end();
    systemLogger.info("Database connection closed successfully.");
  } catch (err) {
    systemLogger.error(
      `Error closing database connection: ${
        err instanceof Error ? err.stack : String(err)
      }`
    );
    throw err;
  }
}
