// frontend/lib/types.ts
// Core types for Asset Management System

export enum AssetType {
  MOBILE_PHONE = "MOBILE_PHONE",
  TABLET = "TABLET",
  DESKTOP = "DESKTOP",
  LAPTOP = "LAPTOP",
  MONITOR = "MONITOR",
}

export enum AssetState {
  AVAILABLE = "AVAILABLE", // Available Stock
  SIGNED_OUT = "SIGNED_OUT", // Signed Out for building/configuration
  BUILT = "BUILT", // Built and configured (phones, tablets, desktops, laptops only)
  READY_TO_GO = "READY_TO_GO", // Ready To Go Stock (RTGS)
  ISSUED = "ISSUED", // Issued to individuals or locations
}

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface Asset {
  id: string;
  assetNumber: string; // Format: XX-YYYYY (prefix + 5-digit sequence)
  type: AssetType;
  state: AssetState;
  serialNumber: string;
  description: string;
  purchasePrice: number;
  location: string;
  assignmentType: "INDIVIDUAL" | "SHARED";
  assignedTo?: string; // Person name for individual assignments
  employeeId?: string; // Employee ID for individual assignments
  department?: string; // Department for assignments
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete tracking
}

export interface User {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: UserRole;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetHistory {
  id: string;
  assetId: string;
  previousState?: AssetState;
  newState: AssetState;
  changedBy: string; // User ID who made the change
  changeReason?: string;
  timestamp: Date;
  details?: Record<string, any>; // Additional change details
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  userId?: string; // For individual assignments
  locationId?: string; // For shared/location assignments
  assignmentType: "INDIVIDUAL" | "SHARED";
  assignedAt: Date;
  assignedBy: string; // User ID who made the assignment
  unassignedAt?: Date;
}

// Dashboard data types
export interface DashboardData {
  totalAssets: number;
  assetsByType: Record<AssetType, number>;
  assetsByState: Record<AssetState, number>;
  assetsByLocation: Record<string, number>;
  recentActivity: AssetHistory[];
}

// Import system types
export interface ImportMapping {
  sourceColumn: string;
  targetField: keyof Asset;
  required: boolean;
  dataType: "string" | "number" | "date" | "enum";
}

export interface ImportResult {
  successful: number;
  failed: number;
  errors: string[];
  importedAssets: Asset[];
}
