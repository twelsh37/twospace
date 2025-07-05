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

// Polyfill for setImmediate (needed for SuperTest integration tests)
if (typeof global.setImmediate === "undefined") {
  global.setImmediate = (
    callback: (...args: any[]) => void,
    ...args: any[]
  ) => {
    return setTimeout(() => callback(...args), 0);
  };
}

// Mock canvas to prevent native module issues in tests
jest.mock("canvas", () => ({}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock chart.js components
jest.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

// Mock Quagga barcode scanner
jest.mock("quagga", () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  decodeSingle: jest.fn(),
}));

// Mock file upload functionality
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(bits: any[], name: string, options?: any) {
    this.name = name;
    this.size = bits.length;
    this.type = options?.type || "text/plain";
    this.lastModified = options?.lastModified || Date.now();
  }
} as any;

global.FileReader = class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  result: string | ArrayBuffer | null = null;

  readAsText(blob: Blob) {
    setTimeout(() => {
      if (this.onload) {
        this.result = "mock file content";
        this.onload(new ProgressEvent("load"));
      }
    }, 0);
  }

  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      if (this.onload) {
        this.result = "data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=";
        this.onload(new ProgressEvent("load"));
      }
    }, 0);
  }
} as any;
