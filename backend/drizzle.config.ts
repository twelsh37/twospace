// backend/drizzle.config.ts
// Drizzle Kit configuration for Asset Management System

import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Explicitly load variables from .env.local
dotenv.config({ path: ".env.local" });

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set in .env.local");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",

  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  verbose: true,
  strict: true,
});
