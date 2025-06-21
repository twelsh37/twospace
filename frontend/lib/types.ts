// frontend/lib/types.ts
// Core types for Asset Management System

// Enums for internal frontend logic and constants
export enum AssetType {
  MOBILE_PHONE = "MOBILE_PHONE",
  TABLET = "TABLET",
  DESKTOP = "DESKTOP",
  LAPTOP = "LAPTOP",
  MONITOR = "MONITOR",
}

export enum AssetState {
  AVAILABLE = "AVAILABLE",
  SIGNED_OUT = "SIGNED_OUT",
  BUILT = "BUILT",
  READY_TO_GO = "READY_TO_GO",
  ISSUED = "ISSUED",
}

// --- Types reflecting API data structures ---

// Data structure for a single asset, matching the assets API response
export type Asset = {
  assetNumber: string;
  type: string; // Corresponds to AssetType enum
  state: string; // Corresponds to AssetState enum
  serialNumber: string;
  description: string;
  purchasePrice: string;
  location: string;
  assignmentType: string;
  assignedTo?: string;
  employeeId?: string;
  department?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type User = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
};

export type Location = {
  id: string;
  name: string;
  description: string | null;
};

// Type for the pagination object returned by the assets API
export type Pagination = {
  page: number;
  limit: number;
  totalAssets: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

// Type for the aggregated data used on the dashboard, matching the dashboard API response
export type DashboardData = {
  totalAssets: number;
  totalValue: number;
  assetsByState: { state: string; count: number }[];
  assetsByType: { type: string; count: number }[];
  recentActivity: {
    id: string;
    assetId: string;
    newState: string;
    type: string; // The type of asset (e.g., 'LAPTOP')
    changeReason: string | null;
    timestamp: string; // ISO date string
    userName: string;
    assetDescription: string | null;
  }[];
};
