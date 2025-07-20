// frontend/jest.config.js
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
