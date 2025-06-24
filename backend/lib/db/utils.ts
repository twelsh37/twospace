// backend/lib/db/utils.ts
// Database utility functions for Asset Management System

import { eq, sql, and, isNull } from "drizzle-orm";
import { db } from "./index";
import {
  assetsTable,
  assetSequencesTable,
  assetHistoryTable,
  type NewAssetHistory,
} from "./schema";

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

    // Format as XX-YYYYY
    const formattedSequence = sequenceNumber.toString().padStart(5, "0");
    return `${prefix}-${formattedSequence}`;
  } catch (error) {
    console.error("Error generating asset number:", error);
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
  try {
    const historyEntry: NewAssetHistory = {
      assetId,
      newState: newState as
        | "AVAILABLE"
        | "SIGNED_OUT"
        | "BUILT"
        | "READY_TO_GO"
        | "ISSUED",
      changedBy,
      changeReason,
      previousState: previousState as
        | "AVAILABLE"
        | "SIGNED_OUT"
        | "BUILT"
        | "READY_TO_GO"
        | "ISSUED"
        | undefined,
      details: details ? JSON.stringify(details) : null,
    };

    await db.insert(assetHistoryTable).values(historyEntry);
  } catch (error) {
    console.error("Error creating asset history:", error);
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
              | "BUILT"
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
    if (filters?.limit && filters?.offset) {
      return await baseQuery.limit(filters.limit).offset(filters.offset);
    } else if (filters?.limit) {
      return await baseQuery.limit(filters.limit);
    } else if (filters?.offset) {
      return await baseQuery.offset(filters.offset);
    } else {
      return await baseQuery;
    }
  } catch (error) {
    console.error("Error getting active assets:", error);
    throw new Error("Failed to retrieve assets");
  }
}

/**
 * Get asset counts by type and state
 * @returns Promise<object> - Asset statistics
 */
export async function getAssetStatistics() {
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
    console.error("Error getting asset statistics:", error);
    throw new Error("Failed to retrieve asset statistics");
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
  } catch (error) {
    console.error("Error soft deleting asset:", error);
    throw new Error("Failed to delete asset");
  }
}
