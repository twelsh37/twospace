// frontend/jest.config.ci.js
// Jest configuration optimized for CI environments

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Test environment
  testEnvironment: "jsdom",

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/jest.config.*",
    "!**/jest.setup.*",
  ],
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 3,
      lines: 5,
      statements: 5,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",

  // CI optimizations
  maxWorkers: 2,
  workerIdleMemoryLimit: "512MB",

  // Test timeout
  testTimeout: 10000,

  // Verbose output for CI
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Module name mapping
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Transform configuration
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // Test file patterns
  testMatch: [
    "<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
  ],

  // Module file extensions
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],

  // Global setup and teardown (commented out for now)
  // globalSetup: "<rootDir>/jest.global-setup.js",
  // globalTeardown: "<rootDir>/jest.global-teardown.js",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
