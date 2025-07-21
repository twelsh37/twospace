// frontend/lib/types.ts

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
  HOLDING = "HOLDING", // Added to support imported/holding assets (matches backend/DB)
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
