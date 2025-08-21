// frontend/app/admin/configuration/actions.ts

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

"use server";

import { db } from "@/lib/db";
import {
  tenantConfigsTable,
  assetLabelTemplatesTable,
  customAssetTypesTable,
  customAssetStatesTable,
  stateTransitionRulesTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Server Actions for Configuration Management
 *
 * These actions run on the server side to avoid client-side database imports
 */

export interface AssetLabelTemplateConfig {
  companyPrefix: string;
  assetTypeCode: string;
  assetNumber: string;
  separator?: string;
  format: string;
}

export interface TenantConfigData {
  companyName: string;
  companyPrefix: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Get tenant configuration
 */
export async function getTenantConfig(tenantId: string) {
  try {
    const [config] = await db
      .select()
      .from(tenantConfigsTable)
      .where(eq(tenantConfigsTable.tenantId, tenantId))
      .limit(1);

    return { success: true, data: config };
  } catch (error) {
    console.error("Error fetching tenant config:", error);
    return { success: false, error: "Failed to fetch tenant configuration" };
  }
}

/**
 * Get asset label template
 */
export async function getAssetLabelTemplate(tenantId: string) {
  try {
    const [template] = await db
      .select()
      .from(assetLabelTemplatesTable)
      .where(
        and(
          eq(assetLabelTemplatesTable.tenantId, tenantId),
          eq(assetLabelTemplatesTable.isDefault, true)
        )
      )
      .limit(1);

    return { success: true, data: template };
  } catch (error) {
    console.error("Error fetching asset label template:", error);
    return { success: false, error: "Failed to fetch asset label template" };
  }
}

/**
 * Get custom asset types
 */
export async function getCustomAssetTypes(tenantId: string) {
  try {
    const types = await db
      .select()
      .from(customAssetTypesTable)
      .where(
        and(
          eq(customAssetTypesTable.tenantId, tenantId),
          eq(customAssetTypesTable.isActive, true)
        )
      )
      .orderBy(customAssetTypesTable.typeCode);

    return { success: true, data: types };
  } catch (error) {
    console.error("Error fetching custom asset types:", error);
    return { success: false, error: "Failed to fetch asset types" };
  }
}

/**
 * Get custom asset states
 */
export async function getCustomAssetStates(tenantId: string) {
  try {
    const states = await db
      .select()
      .from(customAssetStatesTable)
      .where(
        and(
          eq(customAssetStatesTable.tenantId, tenantId),
          eq(customAssetStatesTable.isActive, true)
        )
      )
      .orderBy(customAssetStatesTable.stateOrder);

    return { success: true, data: states };
  } catch (error) {
    console.error("Error fetching custom asset states:", error);
    return { success: false, error: "Failed to fetch asset states" };
  }
}

/**
 * Update tenant configuration
 */
export async function updateTenantConfig(
  tenantId: string,
  config: Partial<TenantConfigData>
) {
  try {
    const existingConfig = await getTenantConfig(tenantId);

    if (existingConfig.success && existingConfig.data) {
      // Update existing config
      const [updated] = await db
        .update(tenantConfigsTable)
        .set({
          ...config,
          updatedAt: new Date(),
        })
        .where(eq(tenantConfigsTable.id, existingConfig.data.id))
        .returning();

      revalidatePath("/admin/configuration");
      return { success: true, data: updated };
    } else {
      // Create new config
      const [newConfig] = await db
        .insert(tenantConfigsTable)
        .values({
          tenantId,
          ...config,
        })
        .returning();

      revalidatePath("/admin/configuration");
      return { success: true, data: newConfig };
    }
  } catch (error) {
    console.error("Error updating tenant config:", error);
    return { success: false, error: "Failed to update tenant configuration" };
  }
}

/**
 * Update asset label template
 */
export async function updateAssetLabelTemplate(
  tenantId: string,
  template: Partial<AssetLabelTemplateConfig>
) {
  try {
    const existingTemplate = await getAssetLabelTemplate(tenantId);

    if (existingTemplate.success && existingTemplate.data) {
      // Update existing template
      const [updated] = await db
        .update(assetLabelTemplatesTable)
        .set({
          template,
          updatedAt: new Date(),
        })
        .where(eq(assetLabelTemplatesTable.id, existingTemplate.data.id))
        .returning();

      revalidatePath("/admin/configuration");
      return { success: true, data: updated };
    } else {
      // Create new template
      const [newTemplate] = await db
        .insert(assetLabelTemplatesTable)
        .values({
          tenantId,
          templateName: "Custom Template",
          template,
          isDefault: true,
        })
        .returning();

      revalidatePath("/admin/configuration");
      return { success: true, data: newTemplate };
    }
  } catch (error) {
    console.error("Error updating asset label template:", error);
    return { success: false, error: "Failed to update asset label template" };
  }
}
