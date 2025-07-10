// frontend/lib/test-utils.tsx
// Test utilities for React Testing Library with custom render functions and mock data

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock data for testing
export const mockAssets = [
  {
    id: "1",
    assetNumber: "ASSET-001",
    description: "Test Asset 1",
    location: "Building A",
    department: "IT",
    state: "active",
    purchaseDate: "2023-01-01",
    purchasePrice: 1000,
    currentValue: 800,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    assetNumber: "ASSET-002",
    description: "Test Asset 2",
    location: "Building B",
    department: "HR",
    state: "maintenance",
    purchaseDate: "2023-02-01",
    purchasePrice: 2000,
    currentValue: 1500,
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2023-02-01T00:00:00Z",
  },
];

export const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    employeeId: "EMP001",
    department: "IT",
    role: "user",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    employeeId: "EMP002",
    department: "HR",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
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
  },
];

export const mockSettings = {
  reportCacheDuration: 30,
  depreciationSettings: {
    method: "straight" as const,
    years: 4,
    decliningPercents: [50, 25, 12.5, 12.5],
  },
};

// Mock API responses
export const mockApiResponses = {
  assets: {
    list: mockAssets,
    single: mockAssets[0],
    create: { ...mockAssets[0], id: "3" },
    update: { ...mockAssets[0], description: "Updated Asset" },
    delete: { success: true },
  },
  users: {
    list: mockUsers,
    single: mockUsers[0],
    create: { ...mockUsers[0], id: "3" },
    update: { ...mockUsers[0], name: "Updated User" },
    delete: { success: true },
  },
  locations: {
    list: mockLocations,
    single: mockLocations[0],
    create: { ...mockLocations[0], id: "3" },
    update: { ...mockLocations[0], name: "Updated Location" },
    delete: { success: true },
  },
  settings: mockSettings,
  dashboard: {
    stats: {
      totalAssets: 100,
      totalValue: 50000,
      activeAssets: 80,
      maintenanceAssets: 20,
    },
    recentActivity: [
      {
        id: "1",
        type: "asset_created",
        description: "Asset ASSET-001 created",
        timestamp: "2023-01-01T00:00:00Z",
      },
    ],
  },
};

// Custom render function with providers
type CustomRenderOptions = Omit<RenderOptions, "wrapper">;

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from "@testing-library/react";
export { customRender as render, userEvent };

// Mock fetch function
export const mockFetch = (response: unknown, status = 200) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  );
};

// Mock fetch with error
export const mockFetchError = (error: string, status = 500) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error }),
      text: () => Promise.resolve(JSON.stringify({ error })),
    })
  );
};

// Wait for loading to complete
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Create test user with specific permissions
export const createTestUser = (overrides = {}) => ({
  id: "1",
  name: "Test User",
  email: "test@example.com",
  employeeId: "TEST001",
  department: "IT",
  role: "user",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  ...overrides,
});

// Create test asset with specific properties
export const createTestAsset = (overrides = {}) => ({
  id: "1",
  assetNumber: "TEST-001",
  description: "Test Asset",
  location: "Test Location",
  department: "IT",
  state: "active",
  purchaseDate: "2023-01-01",
  purchasePrice: 1000,
  currentValue: 800,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  ...overrides,
});

// Mock localStorage
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
  };
};

// Mock sessionStorage
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
  };
};

// Test data generators
export const generateTestAssets = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    assetNumber: `ASSET-${String(i + 1).padStart(3, "0")}`,
    description: `Test Asset ${i + 1}`,
    location: `Building ${String.fromCharCode(65 + (i % 3))}`,
    department: ["IT", "HR", "Finance"][i % 3],
    state: ["active", "maintenance", "recycled"][i % 3],
    purchaseDate: "2023-01-01",
    purchasePrice: 1000 + i * 100,
    currentValue: 800 + i * 80,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  }));
};

export const generateTestUsers = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    employeeId: `EMP${String(i + 1).padStart(3, "0")}`,
    department: ["IT", "HR", "Finance"][i % 3],
    role: i === 0 ? "admin" : "user",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  }));
};
