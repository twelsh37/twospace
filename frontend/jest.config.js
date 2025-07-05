// frontend/jest.config.js
// Jest configuration for Next.js with TypeScript and React Testing Library using babel-jest

module.exports = {
  // Removed ts-jest preset, now using babel-jest for all JS/TS files
  // Use Node environment for all tests to avoid jsdom/canvas issues
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
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
    "!**/jest.setup.ts",
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
    "/jest.setup.ts",
  ],
  verbose: true,
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
  ],
  // Use babel-jest for all JS/TS/JSX/TSX files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(isows|@supabase|@supabase/.*|@heroicons|lucide-react)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

// Reasoning: Switched from ts-jest to babel-jest for JSX/TSX/JS/TS transformation. This allows Jest to understand JSX and TypeScript using Babel.
