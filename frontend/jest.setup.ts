// frontend/jest.setup.ts

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

import React from "react";
import "@testing-library/jest-dom";

// Polyfill Blob with arrayBuffer for Jest/jsdom
if (typeof global.Blob !== "function" || !global.Blob.prototype.arrayBuffer) {
  class PolyfilledBlob extends (global.Blob || class {}) {
    constructor(parts?: any[], options?: any) {
      super(parts, options);
    }

    async arrayBuffer() {
      // Convert Blob to ArrayBuffer (works for text/csv in tests)
      const text = await this.text();
      const uint8 = new Uint8Array([...text].map((c) => c.charCodeAt(0)));
      return uint8.buffer;
    }
  }
  global.Blob = PolyfilledBlob as any;
}

// Ensure Blob is available in the global scope
if (typeof global.Blob === "undefined") {
  global.Blob = class Blob {
    size: number;
    type: string;
    private _content: string;

    constructor(parts?: any[], options?: any) {
      this._content = parts ? parts.join("") : "";
      this.size = this._content.length;
      this.type = options?.type || "";
    }

    async text() {
      return this._content;
    }

    async arrayBuffer() {
      const uint8 = new Uint8Array(
        [...this._content].map((c) => c.charCodeAt(0))
      );
      return uint8.buffer;
    }
  } as any;
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
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  useSelectedLayoutSegment: () => null,
  useSelectedLayoutSegments: () => [],
  useSegments: () => [],
}));

// Mock Next.js image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", { ...props, alt: props.alt || "" });
  },
}));

// Mock Next.js link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Mock Supabase client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      and: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  })),
}));

// Mock our Supabase configuration
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      and: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

// Mock auth context to avoid import issues
jest.mock("@/lib/auth-context", () => ({
  AuthContext: {
    Provider: ({ children, value }: any) =>
      React.createElement("div", { "data-testid": "auth-provider" }, children),
  },
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Mock SWR for data fetching
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn((key: string, fetcher: any) => {
    if (typeof key === "string" && key.includes("error")) {
      return {
        data: undefined,
        error: new Error("Test error"),
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
    }
    return {
      data: { test: "data" },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
  }),
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => React.createElement("div", { "data-testid": "toaster" }),
}));

// Mock Chart.js
jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
  DoughnutController: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock("react-chartjs-2", () => ({
  Line: () => React.createElement("div", { "data-testid": "line-chart" }),
  Bar: () => React.createElement("div", { "data-testid": "bar-chart" }),
  Doughnut: () =>
    React.createElement("div", { "data-testid": "doughnut-chart" }),
  Pie: () => React.createElement("div", { "data-testid": "pie-chart" }),
}));

// Mock quagga for barcode scanning
jest.mock("quagga", () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  decodeSingle: jest.fn(),
}));

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextRequest: class NextRequest {
    url: string;
    method: string;
    headers: Headers;
    body: any;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }

    async json() {
      if (typeof this.body === "string") {
        return JSON.parse(this.body);
      }
      return this.body;
    }

    async text() {
      if (typeof this.body === "string") {
        return this.body;
      }
      return JSON.stringify(this.body);
    }

    async formData() {
      // Return a mock FormData object
      return {
        get: jest.fn((key: string) => {
          // This will be overridden in the test
          return null;
        }),
      };
    }
  },
  NextResponse: class NextResponse {
    status: number;
    headers: Headers;
    body: any;

    constructor(body?: any, init?: ResponseInit) {
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
      this.body = body;
    }

    static json(data: any, init?: ResponseInit) {
      return new NextResponse(data, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
      });
    }

    static redirect(url: string) {
      return new NextResponse(null, {
        status: 302,
        headers: { Location: url },
      });
    }

    async json() {
      return this.body;
    }

    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body);
    }
  },
}));

// Add Request global for tests
global.Request = class Request {
  url: string;
  method: string;
  headers: Headers;
  body: any;

  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || "GET";
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
  }

  async json() {
    if (typeof this.body === "string") {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    if (typeof this.body === "string") {
      return this.body;
    }
    return JSON.stringify(this.body);
  }
} as any;

// Mock Supabase auth helpers
jest.mock("@/lib/supabase-auth-helpers", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "1" } }, error: null })
      ),
    },
  })),
  requireAuth: jest.fn(() =>
    Promise.resolve({
      data: { user: { id: "1", role: "user" } },
      error: null,
    })
  ),
  requireAdmin: jest.fn(() =>
    Promise.resolve({
      data: { user: { id: "1", role: "admin" } },
      error: null,
    })
  ),
}));

// Mock database connection to avoid connection issues
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve([])),
        orderBy: jest.fn(() => Promise.resolve([])),
        limit: jest.fn(() => Promise.resolve([])),
      })),
    })),
    insert: jest.fn(() => ({
      into: jest.fn(() => ({
        values: jest.fn(() => Promise.resolve({ insertId: "1" })),
      })),
    })),
  },
  assets: {},
  users: {},
  locations: {},
  settings: {},
}));

// Mock logger to avoid console output
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  appLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  systemLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress React DOM render warnings
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }

    // Suppress React act() warnings in tests
    if (
      typeof args[0] === "string" &&
      args[0].includes("An update to") &&
      args[0].includes("inside a test was not wrapped in act")
    ) {
      return;
    }

    // Suppress fetch error details in tests (these are expected in error scenarios)
    if (
      typeof args[0] === "string" &&
      args[0].includes("Fetch error details:")
    ) {
      return;
    }

    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
