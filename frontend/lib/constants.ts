// frontend/lib/constants.ts
// Constants for Asset Management System

import { AssetType, AssetState } from "./types";

// Asset number prefixes based on asset type
export const ASSET_NUMBER_PREFIXES: Record<AssetType, string> = {
  [AssetType.MOBILE_PHONE]: "01",
  [AssetType.TABLET]: "02",
  [AssetType.DESKTOP]: "03",
  [AssetType.LAPTOP]: "04",
  [AssetType.MONITOR]: "05",
};

// Valid state transitions for different asset types
export const VALID_STATE_TRANSITIONS: Record<
  AssetType,
  Record<AssetState, AssetState[]>
> = {
  // Mobile Phones, Tablets, Desktops, Laptops: Available → Signed Out → Built → RTGS → Issued
  [AssetType.MOBILE_PHONE]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILT, AssetState.AVAILABLE],
    [AssetState.BUILT]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED, AssetState.BUILT],
    [AssetState.ISSUED]: [AssetState.READY_TO_GO],
  },
  [AssetType.TABLET]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILT, AssetState.AVAILABLE],
    [AssetState.BUILT]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED, AssetState.BUILT],
    [AssetState.ISSUED]: [AssetState.READY_TO_GO],
  },
  [AssetType.DESKTOP]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILT, AssetState.AVAILABLE],
    [AssetState.BUILT]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED, AssetState.BUILT],
    [AssetState.ISSUED]: [AssetState.READY_TO_GO],
  },
  [AssetType.LAPTOP]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILT, AssetState.AVAILABLE],
    [AssetState.BUILT]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED, AssetState.BUILT],
    [AssetState.ISSUED]: [AssetState.READY_TO_GO],
  },
  // Monitors: Available → Signed Out → RTGS → Issued (no BUILD state)
  [AssetType.MONITOR]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.READY_TO_GO, AssetState.AVAILABLE],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED, AssetState.SIGNED_OUT],
    [AssetState.ISSUED]: [AssetState.READY_TO_GO],
    [AssetState.BUILT]: [], // Monitors don't use BUILT state
  },
};

// Asset state display names
export const ASSET_STATE_LABELS: Record<AssetState, string> = {
  [AssetState.AVAILABLE]: "Available Stock",
  [AssetState.SIGNED_OUT]: "Signed Out",
  [AssetState.BUILT]: "Built",
  [AssetState.READY_TO_GO]: "Ready To Go Stock",
  [AssetState.ISSUED]: "Issued",
};

// Asset type display names
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  [AssetType.MOBILE_PHONE]: "Mobile Phone",
  [AssetType.TABLET]: "Tablet",
  [AssetType.DESKTOP]: "Desktop",
  [AssetType.LAPTOP]: "Laptop",
  [AssetType.MONITOR]: "Monitor",
};

// Initial placeholder locations
export const INITIAL_LOCATIONS = [
  "Headquarters - Floor 1",
  "Headquarters - Floor 2",
  "Headquarters - Floor 3",
  "Branch Office - North",
  "Branch Office - South",
  "Warehouse - Main",
  "IT Department",
  "Reception Area",
  "Conference Room A",
  "Storage Room",
];

// Validation rules
export const VALIDATION_RULES = {
  ASSET_NUMBER_LENGTH: 7, // XX-YYYYY format
  SERIAL_NUMBER_MIN_LENGTH: 3,
  DESCRIPTION_MIN_LENGTH: 5,
  PURCHASE_PRICE_MIN: 0.01,
  EMPLOYEE_ID_MIN_LENGTH: 3,
};

// API endpoints
export const API_ENDPOINTS = {
  ASSETS: "/api/assets",
  USERS: "/api/users",
  LOCATIONS: "/api/locations",
  DASHBOARD: "/api/dashboard",
  IMPORT: "/api/import",
  AUTH: "/api/auth",
} as const;
