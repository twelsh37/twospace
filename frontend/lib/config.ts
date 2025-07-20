// frontend/lib/config.ts
// Centralized configuration for the application.

import * as dotenv from "dotenv";

// Explicitly load .env.local to ensure variables are available server-side,
// especially in environments where Next.js's default loading might be inconsistent.
dotenv.config({ path: ".env.local" });
