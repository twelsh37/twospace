// frontend/lib/utils.ts

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

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Asset } from "./types";
// NOTE: Do NOT import server-side loggers here. This file is used by both client and server code.
// If you need to log from the client, use console.log or send logs to an API route.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const interval = diffInSeconds / seconds;
    if (interval >= 1) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(-Math.floor(interval), unit);
    }
  }

  return "just now";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Validate asset data for form submission
 * @param asset - Asset data to validate
 * @returns Array of validation error messages
 */
export function validateAsset(asset: Partial<Asset>): string[] {
  const errors: string[] = [];

  if (!asset.type) {
    errors.push("Asset type is required");
  }

  if (!asset.serialNumber || asset.serialNumber.trim() === "") {
    errors.push("Serial number is required");
  }

  if (!asset.description || asset.description.trim() === "") {
    errors.push("Description is required");
  }

  if (
    asset.purchasePrice === undefined ||
    isNaN(parseFloat(asset.purchasePrice)) ||
    parseFloat(asset.purchasePrice) < 0
  ) {
    errors.push("Purchase price must be a positive number");
  }

  if (!asset.location || asset.location.trim() === "") {
    errors.push("Location is required");
  }

  return errors;
}

/**
 * Export an array of objects to CSV and trigger a download.
 * @param data Array of objects to export
 * @param filename Name of the file to save (should end with .csv)
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(","),
    ...data.map((row) =>
      keys.map((k) => JSON.stringify(row[k] ?? "")).join(",")
    ),
  ];
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export an array of objects to XLSX and trigger a download.
 * @param data Array of objects to export
 * @param filename Name of the file to save (should end with .xlsx)
 */
export async function exportToXLSX(
  data: Record<string, unknown>[],
  filename: string
) {
  if (!data || data.length === 0) return;
  // Dynamically import xlsx to avoid bundling if not used
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
