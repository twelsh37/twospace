// filepath: frontend/lib/logger.ts
// Console-based logger for Next.js/TypeScript application
// This file exports two loggers: systemLogger and appLogger
// - systemLogger: logs system-level events (startup, errors, etc.)
// - appLogger: logs application-level events (user actions, business logic, etc.)
//
// Refactored for Vercel compatibility: Vercel does not support file-based logging.
// All logs are output to the console, which Vercel captures and displays in the dashboard.
//
// Reasoning:
// - File-based logging (e.g., Winston, rotating files) is not supported in serverless environments like Vercel.
// - Console logging is the recommended approach for serverless platforms.
// - This logger provides a consistent API for info, warn, and error logs.

interface Logger {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

function formatLog(
  level: string,
  label: string,
  message: string,
  meta?: unknown
): string {
  const timestamp = new Date().toISOString();
  let log = `[${timestamp}] [${label}] ${level}: ${message}`;
  if (meta !== undefined) {
    try {
      log += ` | meta: ${JSON.stringify(meta)}`;
    } catch {
      log += ` | meta: [unserializable]`;
    }
  }
  return log;
}

export const systemLogger: Logger = {
  info: (message, meta) =>
    console.info(formatLog("info", "SYSTEM", message, meta)),
  warn: (message, meta) =>
    console.warn(formatLog("warn", "SYSTEM", message, meta)),
  error: (message, meta) =>
    console.error(formatLog("error", "SYSTEM", message, meta)),
};

export const appLogger: Logger = {
  info: (message, meta) =>
    console.info(formatLog("info", "APP", message, meta)),
  warn: (message, meta) =>
    console.warn(formatLog("warn", "APP", message, meta)),
  error: (message, meta) =>
    console.error(formatLog("error", "APP", message, meta)),
};

// Usage example (remove or comment out in production):
// systemLogger.info('System logger initialized');
// appLogger.info('Application logger initialized');

// Reasoning:
// - File and console transports are replaced with console-only logging for Vercel/serverless compatibility.
// - Extensive comments provided for clarity and maintainability.
