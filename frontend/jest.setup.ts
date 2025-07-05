// Polyfill global Request and Response for Next.js API route compatibility in Jest (synchronous)
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
if (typeof global.Request === "undefined")
  global.Request = require("node-fetch").Request as any;
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
if (typeof global.Response === "undefined")
  global.Response = require("node-fetch").Response as any;

import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

if (typeof global.TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextEncoder = TextEncoder as any;
}
if (typeof global.TextDecoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextDecoder = TextDecoder as any;
}

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
