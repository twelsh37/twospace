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
  BUILDING = "BUILDING",
  READY_TO_GO = "READY_TO_GO",
  ISSUED = "ISSUED",
}

export enum AssignmentType {
  INDIVIDUAL = "INDIVIDUAL",
  SHARED = "SHARED",
}

// --- Types reflecting API data structures ---

// Data structure for a single asset, matching the assets API response
export interface Asset {
  assetNumber: string;
  type: AssetType;
  state: AssetState;
  serialNumber: string;
  description: string;
  purchasePrice: string;
  location: string;
  assignmentType: AssignmentType;
  assignedTo: string | null;
  employeeId: string | null;
  department: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: string; // Asset status (active, stock, recycled, holding)
}

export type User = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
};

export interface Location {
  id: string;
  name: string;
  description?: string;
}

// Type for the pagination object returned by the assets API
export interface Pagination {
  page: number;
  limit: number;
  totalAssets: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AssetWithPagination {
  assets: Asset[];
  pagination: Pagination;
}

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

// Enum for user roles, if you implement user management
export enum UserRole {
  ADMIN = "ADMIN",
  // ... existing code ...
}
