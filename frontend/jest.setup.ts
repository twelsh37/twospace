// This file was renamed from jest.setup.js to jest.setup.ts for TypeScript and JSX support.
import "@testing-library/jest-dom";

// Mock Next.js app router hooks globally for tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
