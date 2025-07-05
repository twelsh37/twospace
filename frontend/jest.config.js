// frontend/jest.config.js
// Jest configuration for Next.js with TypeScript and React Testing Library using Babel
// NOTE: Uses babel-jest.config.js for test transformation. This config is for tests only; Next.js app uses SWC for runtime.

module.exports = {
  testEnvironment: "jsdom", // Use jsdom for React component testing
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    ".(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
    "^canvas$": "<rootDir>/__mocks__/canvas.js",
  },
  testMatch: [
    "<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/jest.config.js",
    "!**/jest.setup.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000,
  clearMocks: true,
  collectCoverage: false, // Set to true when running coverage
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/jest.config.js",
    "/jest.setup.tsx",
  ],
  verbose: true,
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
  ],
  // Use Babel for all JavaScript and TypeScript files, with explicit config file
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./babel-jest.config.js" },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(isows|@supabase|@supabase/.*|@heroicons|lucide-react)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
