// backend/lib/db/utils.ts

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

// Database utility functions for Asset Management System

import { eq, sql, and, isNull } from "drizzle-orm";
import { db } from "./index";
import {
  assetsTable,
  assetSequencesTable,
  assetHistoryTable,
  type NewAssetHistory,
} from "./schema";
import { systemLogger, appLogger } from "@/lib/logger";

// Asset number prefixes mapping
const ASSET_NUMBER_PREFIXES = {
  MOBILE_PHONE: "01",
  TABLET: "02",
  DESKTOP: "03",
  LAPTOP: "04",
  MONITOR: "05",
} as const;

/**
 * Generate next asset number for a given asset type
 * @param assetType - The type of asset
 * @returns Promise<string> - The generated asset number in format XX-YYYYY
 */
export async function generateAssetNumber(
  assetType: keyof typeof ASSET_NUMBER_PREFIXES
): Promise<string> {
  // Log function entry
  appLogger.info("generateAssetNumber called", { assetType });
  try {
    // Get the prefix for the asset type
    const prefix = ASSET_NUMBER_PREFIXES[assetType];

    // Get and increment the sequence number
    const result = await db
      .update(assetSequencesTable)
      .set({
        nextSequence: sql`${assetSequencesTable.nextSequence} + 1`,
      })
      .where(eq(assetSequencesTable.assetType, assetType))
      .returning({ nextSequence: assetSequencesTable.nextSequence });

    if (result.length === 0) {
      throw new Error(`Asset sequence not found for type: ${assetType}`);
    }

    const sequenceNumber = result[0].nextSequence - 1; // We incremented it, so subtract 1 to get the actual number

    // Format as XX-YYYYY (limit sequence to 5 digits to keep total length <= 10)
    const formattedSequence = (sequenceNumber % 100000)
      .toString()
      .padStart(5, "0");
    appLogger.info("Generated asset number", {
      assetType,
      assetNumber: `${prefix}-${formattedSequence}`,
    });
    return `${prefix}-${formattedSequence}`;
  } catch (error) {
    systemLogger.error(
      `Error generating asset number: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    throw new Error("Failed to generate asset number");
  }
}

/**
 * Create asset history entry
 * @param assetId - Asset ID
 * @param newState - New asset state
 * @param changedBy - User ID who made the change
 * @param changeReason - Reason for the change
 * @param previousState - Previous state (optional)
 * @param details - Additional details (optional)
 */
export async function createAssetHistory(
  assetId: string,
  newState: string,
  changedBy: string,
  changeReason: string,
  previousState?: string,
  details?: Record<string, unknown>
): Promise<void> {
  // Log function entry
  appLogger.info("createAssetHistory called", {
    assetId,
    newState,
    changedBy,
    changeReason,
    previousState,
  });
  try {
    const historyEntry: NewAssetHistory = {
      assetId,
      newState: newState as
        | "AVAILABLE"
        | "SIGNED_OUT"
        | "BUILDING"
        | "READY_TO_GO"
        | "ISSUED",
      changedBy,
      changeReason,
      previousState: previousState as
        | "AVAILABLE"
        | "SIGNED_OUT"
        | "BUILDING"
        | "READY_TO_GO"
        | "ISSUED"
        | undefined,
      details: details ? JSON.stringify(details) : null,
    };

    await db.insert(assetHistoryTable).values(historyEntry);
    appLogger.info("Asset history entry created", { assetId, newState });
  } catch (error) {
    systemLogger.error(
      `Error creating asset history: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    throw new Error("Failed to create asset history");
  }
}

/**
 * Get active assets (not soft deleted)
 * @param filters - Optional filters
 * @returns Promise<Asset[]> - Array of active assets
 */
export async function getActiveAssets(filters?: {
  type?: string;
  state?: string;
  locationId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  // Log function entry
  appLogger.info("getActiveAssets called", { filters });
  try {
    const conditions = [isNull(assetsTable.deletedAt)];

    // Apply filters if provided
    if (filters) {
      if (filters.type && filters.type !== "all") {
        conditions.push(
          eq(
            assetsTable.type,
            filters.type as
              | "MOBILE_PHONE"
              | "TABLET"
              | "DESKTOP"
              | "LAPTOP"
              | "MONITOR"
          )
        );
      }

      if (filters.state && filters.state !== "all") {
        conditions.push(
          eq(
            assetsTable.state,
            filters.state as
              | "AVAILABLE"
              | "SIGNED_OUT"
              | "BUILDING"
              | "READY_TO_GO"
              | "ISSUED"
          )
        );
      }

      if (filters.locationId && filters.locationId !== "all") {
        conditions.push(eq(assetsTable.locationId, filters.locationId));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search.toLowerCase()}%`;
        conditions.push(
          sql`(
            LOWER(${assetsTable.assetNumber}) LIKE ${searchTerm} OR
            LOWER(${assetsTable.serialNumber}) LIKE ${searchTerm} OR
            LOWER(${assetsTable.description}) LIKE ${searchTerm} OR
            LOWER(${assetsTable.assignedTo}) LIKE ${searchTerm}
          )`
        );
      }
    }

    // Build query with all conditions at once
    const baseQuery = db
      .select()
      .from(assetsTable)
      .where(and(...conditions));

    // Apply pagination if specified
    const result = await (filters?.limit && filters?.offset
      ? baseQuery.limit(filters.limit).offset(filters.offset)
      : filters?.limit
      ? baseQuery.limit(filters.limit)
      : filters?.offset
      ? baseQuery.offset(filters.offset)
      : baseQuery);
    appLogger.info("Active assets fetched", { count: result.length });
    return result;
  } catch (error) {
    systemLogger.error(
      `Error getting active assets: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    throw new Error("Failed to retrieve assets");
  }
}

/**
 * Get asset counts by type and state
 * @returns Promise<object> - Asset statistics
 */
export async function getAssetStatistics() {
  // Log function entry
  appLogger.info("getAssetStatistics called");
  try {
    const totalAssets = await db
      .select({ count: sql<number>`count(*)` })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt));

    const assetsByType = await db
      .select({
        type: assetsTable.type,
        count: sql<number>`count(*)`,
      })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt))
      .groupBy(assetsTable.type);

    const assetsByState = await db
      .select({
        state: assetsTable.state,
        count: sql<number>`count(*)`,
      })
      .from(assetsTable)
      .where(isNull(assetsTable.deletedAt))
      .groupBy(assetsTable.state);

    appLogger.info("Asset statistics fetched");
    return {
      totalAssets: totalAssets[0]?.count || 0,
      assetsByType: assetsByType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>),
      assetsByState: assetsByState.reduce((acc, item) => {
        acc[item.state] = item.count;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    systemLogger.error(
      `Error getting asset statistics: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    throw new Error("Failed to get asset statistics");
  }
}

/**
 * Soft delete an asset
 * @param assetId - Asset ID to delete
 * @param deletedBy - User ID who deleted the asset
 */
export async function softDeleteAsset(
  assetId: string,
  deletedBy: string
): Promise<void> {
  // Log function entry
  appLogger.info("softDeleteAsset called", { assetId, deletedBy });
  try {
    const now = new Date();

    // Update asset with deletion timestamp
    await db
      .update(assetsTable)
      .set({ deletedAt: now })
      .where(eq(assetsTable.assetNumber, assetId));

    // Create history entry
    await createAssetHistory(
      assetId,
      "DELETED",
      deletedBy,
      "Asset soft deleted",
      undefined,
      { deletedAt: now.toISOString() }
    );
    appLogger.info("Asset soft deleted", { assetId });
  } catch (error) {
    systemLogger.error(
      `Error soft deleting asset: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    throw new Error("Failed to soft delete asset");
  }
}
