// frontend/lib/constants.ts

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
  // Mobile Phones, Tablets, Desktops, Laptops:
  // Available → Signed Out → Building → RTGS → Issued → Available (must rebuild)
  [AssetType.MOBILE_PHONE]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILDING, AssetState.AVAILABLE],
    [AssetState.BUILDING]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED],
    [AssetState.ISSUED]: [AssetState.AVAILABLE], // Can only return to Available, must rebuild
    [AssetState.HOLDING]: [AssetState.AVAILABLE], // Holding assets can move to Available
  },
  [AssetType.TABLET]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILDING, AssetState.AVAILABLE],
    [AssetState.BUILDING]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED],
    [AssetState.ISSUED]: [AssetState.AVAILABLE], // Can only return to Available, must rebuild
    [AssetState.HOLDING]: [AssetState.AVAILABLE], // Holding assets can move to Available
  },
  [AssetType.DESKTOP]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILDING, AssetState.AVAILABLE],
    [AssetState.BUILDING]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED],
    [AssetState.ISSUED]: [AssetState.AVAILABLE], // Can only return to Available, must rebuild
    [AssetState.HOLDING]: [AssetState.AVAILABLE], // Holding assets can move to Available
  },
  [AssetType.LAPTOP]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.BUILDING, AssetState.AVAILABLE],
    [AssetState.BUILDING]: [AssetState.READY_TO_GO, AssetState.SIGNED_OUT],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED],
    [AssetState.ISSUED]: [AssetState.AVAILABLE], // Can only return to Available, must rebuild
    [AssetState.HOLDING]: [AssetState.AVAILABLE], // Holding assets can move to Available
  },
  // Monitors: Available → Signed Out → RTGS → Issued → Available (no BUILDING state)
  [AssetType.MONITOR]: {
    [AssetState.AVAILABLE]: [AssetState.SIGNED_OUT],
    [AssetState.SIGNED_OUT]: [AssetState.READY_TO_GO, AssetState.AVAILABLE],
    [AssetState.READY_TO_GO]: [AssetState.ISSUED],
    [AssetState.ISSUED]: [AssetState.AVAILABLE], // Can only return to Available
    [AssetState.BUILDING]: [], // Monitors don't use BUILDING state
    [AssetState.HOLDING]: [AssetState.AVAILABLE], // Holding assets can move to Available
  },
};

/**
 * Get the valid next states for a given asset type and current state.
 * @param type The type of the asset.
 * @param currentState The current state of the asset.
 * @returns An array of valid next states.
 */
export function getValidNextStates(
  type: AssetType,
  currentState: AssetState
): AssetState[] {
  return VALID_STATE_TRANSITIONS[type]?.[currentState] || [];
}

// Asset state display names
export const ASSET_STATE_LABELS: Record<AssetState, string> = {
  [AssetState.AVAILABLE]: "Available Stock",
  [AssetState.SIGNED_OUT]: "Signed Out",
  [AssetState.BUILDING]: "Building",
  [AssetState.READY_TO_GO]: "Ready To Go Stock",
  [AssetState.ISSUED]: "Issued",
  [AssetState.HOLDING]: "Holding (Imported)", // Added for imported/holding assets
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

// Utility function to map asset state to solid background color classes (centralized for reuse)
export function getStateColorClass(state: AssetState): string {
  // AVAILABLE - Blue, SIGNED_OUT - Teal, BUILDING - Orange, READY_TO_GO - Purple, ISSUED - Green
  switch (state) {
    case AssetState.AVAILABLE:
      return "bg-blue-600 text-white";
    case AssetState.SIGNED_OUT:
      return "bg-teal-600 text-white";
    case AssetState.BUILDING:
      return "bg-orange-500 text-white";
    case AssetState.READY_TO_GO:
      return "bg-purple-600 text-white";
    case AssetState.ISSUED:
      return "bg-green-600 text-white";
    default:
      return "bg-gray-400 text-white";
  }
}
