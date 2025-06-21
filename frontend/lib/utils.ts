// frontend/lib/utils.ts
// Utility functions for Asset Management System

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AssetType, AssetState, Asset } from "./types";
import { ASSET_NUMBER_PREFIXES, VALID_STATE_TRANSITIONS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate asset number in format XX-YYYYY
 * @param type Asset type to determine prefix
 * @param sequence 5-digit sequence number
 * @returns Formatted asset number
 */
export function generateAssetNumber(type: AssetType, sequence: number): string {
  const prefix = ASSET_NUMBER_PREFIXES[type];
  const paddedSequence = sequence.toString().padStart(5, "0");
  return `${prefix}-${paddedSequence}`;
}

/**
 * Parse asset number to extract type and sequence
 * @param assetNumber Asset number in format XX-YYYYY
 * @returns Object with type and sequence, or null if invalid
 */
export function parseAssetNumber(
  assetNumber: string
): { type: AssetType; sequence: number } | null {
  const match = assetNumber.match(/^(\d{2})-(\d{5})$/);
  if (!match) return null;

  const [, prefix, sequenceStr] = match;
  const sequence = parseInt(sequenceStr, 10);

  // Find asset type by prefix
  const type = Object.entries(ASSET_NUMBER_PREFIXES).find(
    ([, prefixValue]) => prefixValue === prefix
  )?.[0] as AssetType;

  if (!type) return null;

  return { type, sequence };
}

/**
 * Check if state transition is valid for given asset type
 * @param assetType Type of asset
 * @param fromState Current state
 * @param toState Target state
 * @returns true if transition is valid
 */
export function isValidStateTransition(
  assetType: AssetType,
  fromState: AssetState,
  toState: AssetState
): boolean {
  const validTransitions = VALID_STATE_TRANSITIONS[assetType];
  return validTransitions[fromState]?.includes(toState) ?? false;
}

/**
 * Get valid next states for an asset
 * @param assetType Type of asset
 * @param currentState Current state
 * @returns Array of valid next states
 */
export function getValidNextStates(
  assetType: AssetType,
  currentState: AssetState
): AssetState[] {
  return VALID_STATE_TRANSITIONS[assetType][currentState] ?? [];
}

/**
 * Format currency value
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date for display
 * @param date Date to format
 * @param includeTime Whether to include time
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, includeTime = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (includeTime) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date Date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return formatDate(dateObj);
}

/**
 * Validate asset data
 * @param asset Partial asset data
 * @returns Validation errors
 */
export function validateAsset(asset: Partial<Asset>): string[] {
  const errors: string[] = [];

  if (!asset.type) errors.push("Asset type is required");
  if (!asset.serialNumber?.trim()) errors.push("Serial number is required");
  if (asset.serialNumber && asset.serialNumber.length < 3) {
    errors.push("Serial number must be at least 3 characters");
  }
  if (!asset.description?.trim()) errors.push("Description is required");
  if (asset.description && asset.description.length < 5) {
    errors.push("Description must be at least 5 characters");
  }
  if (!asset.purchasePrice || asset.purchasePrice <= 0) {
    errors.push("Purchase price must be greater than 0");
  }
  if (!asset.location?.trim()) errors.push("Location is required");

  return errors;
}

/**
 * Generate unique ID (simple implementation for development)
 * @returns UUID-like string
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Sleep utility for testing
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function for search inputs
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
