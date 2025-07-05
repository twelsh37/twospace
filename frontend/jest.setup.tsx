// Polyfill global Request and Response for Next.js API route compatibility in Jest (synchronous)
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (typeof global.Request === "undefined")
  global.Request = require("node-fetch").Request;
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (typeof global.Response === "undefined")
  global.Response = require("node-fetch").Response;

import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

if (typeof global.TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextDecoder = TextDecoder;
}

// Polyfill for setImmediate (needed for SuperTest integration tests)
if (typeof global.setImmediate === "undefined") {
  global.setImmediate = (callback, ...args) => {
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
  default: (props) => {
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
  constructor(bits, name, options) {
    this.name = name;
    this.size = bits.length;
    this.type = (options && options.type) || "text/plain";
    this.lastModified = (options && options.lastModified) || Date.now();
  }
};

global.FileReader = class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }

  readAsText(blob) {
    setTimeout(() => {
      if (this.onload) {
        this.result = "mock file content";
        this.onload(new ProgressEvent("load"));
      }
    }, 0);
  }

  readAsDataURL(blob) {
    setTimeout(() => {
      if (this.onload) {
        this.result = "data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=";
        this.onload(new ProgressEvent("load"));
      }
    }, 0);
  }
};
