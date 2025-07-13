// filepath: frontend/lib/logger.ts
// Winston logger setup for Next.js/TypeScript application
// This file exports two loggers: systemLogger and appLogger
// - systemLogger: logs system-level events (startup, errors, etc.)
// - appLogger: logs application-level events (user actions, business logic, etc.)
// Logs are written to separate files in frontend/logs/ and also to the console in development.

import winston from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

// Changed log directory to /logs for simplicity and clarity
const logDir = path.join(process.cwd(), "logs");

// Helper to create a logger with daily rotating file and console transports
function createLogger(filename: string, label: string) {
  return winston.createLogger({
    level: "info", // Default log level
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, label }) => {
        // Log format: [timestamp] [label] level: message
        return `[${timestamp}] [${label}] ${level}: ${message}`;
      })
    ),
    transports: [
      // Daily rotating file transport: logs to a file in the logs directory, rotated daily
      new DailyRotateFile({
        filename: path.join(logDir, `${filename}_%DATE%.log`),
        datePattern: "YYYYMMDD",
        zippedArchive: false,
        maxFiles: "30d", // Keep logs for 30 days
      }),
      // Console transport: logs to the console (only in development)
      ...(process.env.NODE_ENV !== "production"
        ? [new winston.transports.Console()]
        : []),
    ],
    // Handle uncaught exceptions and rejections for system logger
    exceptionHandlers:
      label === "SYSTEM"
        ? [
            new DailyRotateFile({
              filename: path.join(logDir, `system-exceptions_%DATE%.log`),
              datePattern: "YYYYMMDD",
              zippedArchive: false,
              maxFiles: "30d",
            }),
          ]
        : undefined,
    rejectionHandlers:
      label === "SYSTEM"
        ? [
            new DailyRotateFile({
              filename: path.join(logDir, `system-rejections_%DATE%.log`),
              datePattern: "YYYYMMDD",
              zippedArchive: false,
              maxFiles: "30d",
            }),
          ]
        : undefined,
  });
}

// System logger: for system-level events
export const systemLogger = createLogger("system.log", "SYSTEM");

// Application logger: for application-level events
export const appLogger = createLogger("application.log", "APP");

// Usage example (remove or comment out in production):
// systemLogger.info('System logger initialized');
// appLogger.info('Application logger initialized');

// Reasoning:
// - Separate loggers keep system and application logs organized.
// - File and console transports help with both development and production debugging.
// - Exception/rejection handlers on systemLogger catch unhandled errors for diagnostics.
// - Extensive comments provided for clarity and maintainability.
