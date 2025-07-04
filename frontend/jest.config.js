// frontend/jest.config.js
// Jest configuration for Next.js with TypeScript and React Testing Library using ts-jest

module.exports = {
  preset: "ts-jest", // Use ts-jest for TypeScript transformation
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    ".(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
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
  // Use ts-jest for TypeScript and allow ESM modules in node_modules to be transformed
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(isows|@supabase|@supabase/.*|@heroicons|lucide-react)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

// Reasoning: Updated setupFilesAfterEnv and ignore patterns to use jest.setup.ts for TypeScript/JSX support.
