// frontend/jest.config.js

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Modern Jest configuration for Next.js with TypeScript and React Testing Library

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Improved module mapping for better path resolution
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    ".(css|less|scss|sass)$": "identity-obj-proxy",
    ".(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // Comprehensive test matching patterns
  testMatch: [
    "<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/**/test/**/*.{js,jsx,ts,tsx}",
  ],

  // Enhanced coverage collection with better exclusions
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
    "!**/__mocks__/**",
    "!**/*.config.{js,ts}",
    "!**/types/**",
    "!**/drizzle/**",
    "!**/scripts/**",
  ],

  // Realistic coverage thresholds for current development state
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 4,
      lines: 8,
      statements: 8,
    },
    // Lower thresholds for specific directories that are harder to test
    "./app/": {
      branches: 3,
      functions: 2,
      lines: 3,
      statements: 3,
    },
    "./components/ui/": {
      branches: 5,
      functions: 10,
      lines: 30,
      statements: 30,
    },
  },

  coverageReporters: ["text", "lcov", "html", "json"],
  coverageDirectory: "coverage",

  // Performance optimizations
  maxWorkers: "50%",
  testTimeout: 15000,
  clearMocks: true,
  collectCoverage: false, // Set to true when running coverage

  // Better transform configuration
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: false,
      },
    ],
    "^.+\\.(js|jsx)$": [
      "ts-jest",
      {
        useESM: false,
      },
    ],
  },

  // Improved transform ignore patterns for better compatibility
  transformIgnorePatterns: [
    "/node_modules/(?!(isows|@supabase|@supabase/.*|@heroicons|lucide-react|react-icons)/)",
  ],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Better test path exclusions
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
    "<rootDir>/drizzle/",
    "<rootDir>/scripts/",
  ],

  // Verbose output for better debugging
  verbose: true,

  // Coverage path ignore patterns
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/jest.config.js",
    "/jest.setup.ts",
    "/__mocks__/",
    "/types/",
    "/drizzle/",
    "/scripts/",
  ],

  // Global test setup - removed deprecated globals config
};
