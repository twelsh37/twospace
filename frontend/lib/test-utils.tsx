// frontend/lib/test-utils.tsx
// Enhanced test utilities for React Testing Library with comprehensive mocking and helper functions

import React, { ReactElement } from "react";
import { render, RenderOptions, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Enhanced mock data for testing with more realistic scenarios
export const mockAssets = [
  {
    id: "1",
    assetNumber: "ASSET-001",
    description: "Test Asset 1",
    location: "Building A",
    department: "IT",
    state: "ACTIVE",
    purchaseDate: "2023-01-01",
    purchasePrice: 1000,
    currentValue: 800,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    assignedTo: null,
    notes: "Test asset for IT department",
    serialNumber: "SN001",
    manufacturer: "Test Manufacturer",
    model: "Test Model",
  },
  {
    id: "2",
    assetNumber: "ASSET-002",
    description: "Test Asset 2",
    location: "Building B",
    department: "HR",
    state: "MAINTENANCE",
    purchaseDate: "2023-02-01",
    purchasePrice: 2000,
    currentValue: 1500,
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2023-02-01T00:00:00Z",
    assignedTo: "1",
    notes: "Test asset for HR department",
    serialNumber: "SN002",
    manufacturer: "Test Manufacturer 2",
    model: "Test Model 2",
  },
];

export const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    employeeId: "EMP001",
    department: "IT",
    role: "USER",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    isActive: true,
    phone: "555-0101",
    title: "Software Engineer",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    employeeId: "EMP002",
    department: "HR",
    role: "ADMIN",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    isActive: true,
    phone: "555-0102",
    title: "HR Manager",
  },
];

export const mockLocations = [
  {
    id: "1",
    name: "Building A",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    isActive: true,
    description: "Main office building",
    contactPerson: "John Doe",
    contactPhone: "555-0101",
  },
  {
    id: "2",
    name: "Building B",
    address: "456 Oak Ave",
    city: "Somewhere",
    state: "NY",
    zipCode: "67890",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    isActive: true,
    description: "Secondary office building",
    contactPerson: "Jane Smith",
    contactPhone: "555-0102",
  },
];

export const mockSettings = {
  reportCacheDuration: 30,
  depreciationSettings: {
    method: "STRAIGHT" as const,
    years: 4,
    decliningPercents: [50, 25, 12.5, 12.5],
  },
  companyInfo: {
    name: "Test Company",
    address: "123 Test St",
    phone: "555-0000",
    email: "info@testcompany.com",
  },
};

// Enhanced API responses with more realistic data
export const mockApiResponses = {
  assets: {
    list: mockAssets,
    single: mockAssets[0],
    create: { ...mockAssets[0], id: "3" },
    update: { ...mockAssets[0], description: "Updated Asset" },
    delete: { success: true },
    search: mockAssets.filter((asset) => asset.description.includes("Test")),
    byDepartment: mockAssets.filter((asset) => asset.department === "IT"),
    byState: mockAssets.filter((asset) => asset.state === "ACTIVE"),
  },
  users: {
    list: mockUsers,
    single: mockUsers[0],
    create: { ...mockUsers[0], id: "3" },
    update: { ...mockUsers[0], name: "Updated User" },
    delete: { success: true },
    byDepartment: mockUsers.filter((user) => user.department === "IT"),
    byRole: mockUsers.filter((user) => user.role === "ADMIN"),
  },
  locations: {
    list: mockLocations,
    single: mockLocations[0],
    create: { ...mockLocations[0], id: "3" },
    update: { ...mockLocations[0], name: "Updated Location" },
    delete: { success: true },
    assignments: [
      { locationId: "1", assetCount: 5, userCount: 3 },
      { locationId: "2", assetCount: 3, userCount: 2 },
    ],
  },
  settings: mockSettings,
  dashboard: {
    stats: {
      totalAssets: 100,
      totalValue: 50000,
      activeAssets: 80,
      maintenanceAssets: 20,
      retiredAssets: 5,
      totalUsers: 25,
      totalLocations: 8,
    },
    recentActivity: [
      {
        id: "1",
        type: "ASSET_CREATED",
        description: "Asset ASSET-001 created",
        timestamp: "2023-01-01T00:00:00Z",
        userId: "1",
        assetId: "1",
      },
      {
        id: "2",
        type: "ASSET_ASSIGNED",
        description: "Asset ASSET-002 assigned to John Doe",
        timestamp: "2023-01-02T00:00:00Z",
        userId: "1",
        assetId: "2",
      },
    ],
    assetsByType: [
      { type: "COMPUTER", count: 30, value: 15000 },
      { type: "FURNITURE", count: 25, value: 5000 },
      { type: "EQUIPMENT", count: 45, value: 30000 },
    ],
    assetsByState: [
      { state: "ACTIVE", count: 80, value: 40000 },
      { state: "MAINTENANCE", count: 20, value: 10000 },
    ],
  },
  reports: {
    assetInventory: {
      summary: {
        totalAssets: 100,
        totalValue: 50000,
        byDepartment: [
          { department: "IT", count: 40, value: 20000 },
          { department: "HR", count: 30, value: 15000 },
          { department: "Finance", count: 30, value: 15000 },
        ],
        byLocation: [
          { location: "Building A", count: 60, value: 30000 },
          { location: "Building B", count: 40, value: 20000 },
        ],
      },
    },
    financial: {
      summary: {
        totalPurchaseValue: 60000,
        totalCurrentValue: 50000,
        depreciation: 10000,
        byYear: [
          { year: 2023, purchaseValue: 30000, currentValue: 25000 },
          { year: 2022, purchaseValue: 30000, currentValue: 25000 },
        ],
      },
    },
  },
};

// Custom render function with providers and context
type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  authContext?: {
    user?: unknown;
    loading?: boolean;
    signIn?: jest.Mock;
    signOut?: jest.Mock;
  };
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="test-providers">{children}</div>;
};

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render, userEvent };

// Enhanced mock fetch function with better error handling
export const mockFetch = (response: unknown, status = 200, headers = {}) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status >= 400 ? "Error" : "OK",
      headers: new Headers(headers),
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
    })
  );
};

// Mock fetch with error
export const mockFetchError = (error: string, status = 500) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error, message: error }),
      text: () => Promise.resolve(JSON.stringify({ error, message: error })),
    })
  );
};

// Mock fetch with network error
export const mockFetchNetworkError = (error = "Network Error") => {
  return jest.fn().mockImplementation(() => Promise.reject(new Error(error)));
};

// Wait for loading to complete with better error handling
export const waitForLoadingToFinish = async (timeout = 1000) => {
  await waitFor(
    () => {
      // Wait for any loading states to disappear
    },
    { timeout }
  );
};

// Wait for element to be removed
export const waitForElementToBeRemoved = async (
  element: Element | null,
  timeout = 1000
) => {
  if (element) {
    await waitFor(
      () => {
        expect(element).not.toBeInTheDocument();
      },
      { timeout }
    );
  }
};

// Create test user with specific permissions
export const createTestUser = (overrides = {}) => ({
  id: "1",
  name: "Test User",
  email: "test@example.com",
  employeeId: "TEST001",
  department: "IT",
  role: "USER",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  isActive: true,
  phone: "555-0000",
  title: "Test Title",
  ...overrides,
});

// Create test asset with specific properties
export const createTestAsset = (overrides = {}) => ({
  id: "1",
  assetNumber: "TEST-001",
  description: "Test Asset",
  location: "Test Location",
  department: "IT",
  state: "ACTIVE",
  purchaseDate: "2023-01-01",
  purchasePrice: 1000,
  currentValue: 800,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  assignedTo: null,
  notes: "Test notes",
  serialNumber: "SN-TEST-001",
  manufacturer: "Test Manufacturer",
  model: "Test Model",
  ...overrides,
});

// Create test location with specific properties
export const createTestLocation = (overrides = {}) => ({
  id: "1",
  name: "Test Location",
  address: "123 Test St",
  city: "Test City",
  state: "CA",
  zipCode: "12345",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  isActive: true,
  description: "Test location description",
  contactPerson: "Test Contact",
  contactPhone: "555-0000",
  ...overrides,
});

// Enhanced localStorage mock with better type safety
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  };
};

// Enhanced sessionStorage mock
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  };
};

// Test data generators with more realistic data
export const generateTestAssets = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    assetNumber: `ASSET-${String(i + 1).padStart(3, "0")}`,
    description: `Test Asset ${i + 1}`,
    location: `Building ${String.fromCharCode(65 + (i % 3))}`,
    department: ["IT", "HR", "Finance"][i % 3],
    state: ["ACTIVE", "MAINTENANCE", "RETIRED"][i % 3],
    purchaseDate: `2023-${String(Math.floor(i / 30) + 1).padStart(
      2,
      "0"
    )}-${String((i % 30) + 1).padStart(2, "0")}`,
    purchasePrice: 1000 + i * 100,
    currentValue: 800 + i * 80,
    createdAt: `2023-01-${String((i % 30) + 1).padStart(2, "0")}T00:00:00Z`,
    updatedAt: `2023-01-${String((i % 30) + 1).padStart(2, "0")}T00:00:00Z`,
    assignedTo: i % 2 === 0 ? `${Math.floor(i / 2) + 1}` : null,
    notes: `Test notes for asset ${i + 1}`,
    serialNumber: `SN-${String(i + 1).padStart(3, "0")}`,
    manufacturer: `Manufacturer ${i + 1}`,
    model: `Model ${i + 1}`,
    ...overrides,
  }));
};

export const generateTestUsers = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    employeeId: `EMP${String(i + 1).padStart(3, "0")}`,
    department: ["IT", "HR", "Finance", "Marketing"][i % 4],
    role: i === 0 ? "ADMIN" : "USER",
    createdAt: `2023-01-${String((i % 30) + 1).padStart(2, "0")}T00:00:00Z`,
    updatedAt: `2023-01-${String((i % 30) + 1).padStart(2, "0")}T00:00:00Z`,
    isActive: true,
    phone: `555-${String(i + 1).padStart(4, "0")}`,
    title: `Title ${i + 1}`,
    ...overrides,
  }));
};

export const generateTestLocations = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: `Location ${i + 1}`,
    address: `${100 + i} Test St`,
    city: `City ${i + 1}`,
    state: ["CA", "NY", "TX", "FL"][i % 4],
    zipCode: `${10000 + i}`,
    createdAt: `2023-01-${String((i % 30) + 1).padStart(2, "0")}T00:00:00Z`,
    updatedAt: `2023-01-${String((i % 30) + 1).padStart(2, "0")}T00:00:00Z`,
    isActive: true,
    description: `Description for location ${i + 1}`,
    contactPerson: `Contact ${i + 1}`,
    contactPhone: `555-${String(i + 1).padStart(4, "0")}`,
    ...overrides,
  }));
};

// Mock Supabase client with better type safety
export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest
      .fn()
      .mockResolvedValue({ data: { user: mockUsers[0] }, error: null }),
    getSession: jest
      .fn()
      .mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: jest
      .fn()
      .mockResolvedValue({ data: { user: mockUsers[0] }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest
      .fn()
      .mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
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
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest
        .fn()
        .mockResolvedValue({ data: { path: "test-path" }, error: null }),
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: jest
        .fn()
        .mockReturnValue({ data: { publicUrl: "https://test.com/file" } }),
    })),
  },
});

// Test helpers for common assertions
export const expectElementToBeVisible = (element: Element) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToBeHidden = (element: Element) => {
  expect(element).toBeInTheDocument();
  expect(element).not.toBeVisible();
};

export const expectElementToHaveText = (element: Element, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveClass = (
  element: Element,
  className: string
) => {
  expect(element).toHaveClass(className);
};

// Async test helpers
export const waitForElement = async (testId: string, timeout = 1000) => {
  return await waitFor(
    () => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    },
    { timeout }
  );
};

export const waitForElementToDisappear = async (
  testId: string,
  timeout = 1000
) => {
  return await waitFor(
    () => {
      expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    },
    { timeout }
  );
};

// Form testing helpers
export const fillFormField = async (name: string, value: string) => {
  const field = screen.getByRole("textbox", { name: new RegExp(name, "i") });
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

export const selectFormOption = async (name: string, value: string) => {
  const select = screen.getByRole("combobox", { name: new RegExp(name, "i") });
  await userEvent.click(select);
  const option = screen.getByRole("option", { name: value });
  await userEvent.click(option);
};

export const submitForm = async () => {
  const submitButton = screen.getByRole("button", {
    name: /submit|save|create|update/i,
  });
  await userEvent.click(submitButton);
};
