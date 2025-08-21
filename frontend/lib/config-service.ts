// frontend/lib/config-service.ts

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

import { db } from "./db";
import {
  tenantConfigsTable,
  assetLabelTemplatesTable,
  customAssetTypesTable,
  customAssetStatesTable,
  stateTransitionRulesTable,
  businessRulesTable,
  type TenantConfig,
  type AssetLabelTemplate,
  type CustomAssetType,
  type CustomAssetState,
  type StateTransitionRule,
  type BusinessRule,
} from "./db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Configuration Service for Multi-Tenant Asset Management
 *
 * This service manages tenant-specific configurations including:
 * - Asset label templates (e.g., AIAA-01-1000)
 * - Custom asset types and states
 * - State transition rules
 * - Business rules and workflows
 */

export interface AssetLabelTemplateConfig {
  companyPrefix: string;
  assetTypeCode: string;
  assetNumber: string;
  separator?: string;
  format: string; // e.g., "{prefix}-{type}-{number}"
}

export interface StateTransitionConfig {
  fromState: string;
  toState: string;
  requiresApproval: boolean;
  requiredFields: string[];
  notes?: string;
}

export interface BusinessRuleConfig {
  ruleName: string;
  ruleType: string;
  config: Record<string, unknown>;
}

export class ConfigService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Get tenant configuration
   */
  async getTenantConfig(): Promise<TenantConfig | null> {
    try {
      const [config] = await db
        .select()
        .from(tenantConfigsTable)
        .where(eq(tenantConfigsTable.tenantId, this.tenantId))
        .limit(1);

      return config || null;
    } catch (error) {
      console.error("Error fetching tenant config:", error);
      return null;
    }
  }

  /**
   * Get asset label template for the tenant
   */
  async getAssetLabelTemplate(): Promise<AssetLabelTemplate | null> {
    try {
      const [template] = await db
        .select()
        .from(assetLabelTemplatesTable)
        .where(
          and(
            eq(assetLabelTemplatesTable.tenantId, this.tenantId),
            eq(assetLabelTemplatesTable.isDefault, true)
          )
        )
        .limit(1);

      return template || null;
    } catch (error) {
      console.error("Error fetching asset label template:", error);
      return null;
    }
  }

  /**
   * Generate asset number based on template
   */
  async generateAssetNumber(
    assetTypeCode: string,
    sequenceNumber: number
  ): Promise<string> {
    try {
      const template = await this.getAssetLabelTemplate();
      if (!template) {
        throw new Error("No asset label template found");
      }

      const config = template.template as AssetLabelTemplateConfig;
      const { companyPrefix, format, separator = "-" } = config;

      // Replace placeholders in format string
      let assetNumber = format
        .replace("{prefix}", companyPrefix)
        .replace("{type}", assetTypeCode)
        .replace("{number}", sequenceNumber.toString().padStart(4, "0"));

      return assetNumber;
    } catch (error) {
      console.error("Error generating asset number:", error);
      throw error;
    }
  }

  /**
   * Get custom asset types for the tenant
   */
  async getCustomAssetTypes(): Promise<CustomAssetType[]> {
    try {
      return await db
        .select()
        .from(customAssetTypesTable)
        .where(
          and(
            eq(customAssetTypesTable.tenantId, this.tenantId),
            eq(customAssetTypesTable.isActive, true)
          )
        )
        .orderBy(customAssetTypesTable.typeCode);
    } catch (error) {
      console.error("Error fetching custom asset types:", error);
      return [];
    }
  }

  /**
   * Get custom asset states for the tenant
   */
  async getCustomAssetStates(): Promise<CustomAssetState[]> {
    try {
      return await db
        .select()
        .from(customAssetStatesTable)
        .where(
          and(
            eq(customAssetStatesTable.tenantId, this.tenantId),
            eq(customAssetStatesTable.isActive, true)
          )
        )
        .orderBy(customAssetStatesTable.stateOrder);
    } catch (error) {
      console.error("Error fetching custom asset states:", error);
      return [];
    }
  }

  /**
   * Get valid state transitions for an asset type
   */
  async getValidStateTransitions(
    assetTypeId: string
  ): Promise<StateTransitionRule[]> {
    try {
      return await db
        .select()
        .from(stateTransitionRulesTable)
        .where(
          and(
            eq(stateTransitionRulesTable.tenantId, this.tenantId),
            eq(stateTransitionRulesTable.assetTypeId, assetTypeId),
            eq(stateTransitionRulesTable.isActive, true)
          )
        );
    } catch (error) {
      console.error("Error fetching state transitions:", error);
      return [];
    }
  }

  /**
   * Get business rules for the tenant
   */
  async getBusinessRules(): Promise<BusinessRule[]> {
    try {
      return await db
        .select()
        .from(businessRulesTable)
        .where(
          and(
            eq(businessRulesTable.tenantId, this.tenantId),
            eq(businessRulesTable.isActive, true)
          )
        );
    } catch (error) {
      console.error("Error fetching business rules:", error);
      return [];
    }
  }

  /**
   * Create or update tenant configuration
   */
  async upsertTenantConfig(
    config: Partial<TenantConfig>
  ): Promise<TenantConfig> {
    try {
      const existingConfig = await this.getTenantConfig();

      if (existingConfig) {
        // Update existing config
        const [updated] = await db
          .update(tenantConfigsTable)
          .set({
            ...config,
            updatedAt: new Date(),
          })
          .where(eq(tenantConfigsTable.id, existingConfig.id))
          .returning();

        return updated;
      } else {
        // Create new config
        const [newConfig] = await db
          .insert(tenantConfigsTable)
          .values({
            tenantId: this.tenantId,
            ...config,
          })
          .returning();

        return newConfig;
      }
    } catch (error) {
      console.error("Error upserting tenant config:", error);
      throw error;
    }
  }

  /**
   * Create or update asset label template
   */
  async upsertAssetLabelTemplate(
    template: Partial<AssetLabelTemplate>
  ): Promise<AssetLabelTemplate> {
    try {
      const existingTemplate = await this.getAssetLabelTemplate();

      if (existingTemplate) {
        // Update existing template
        const [updated] = await db
          .update(assetLabelTemplatesTable)
          .set({
            ...template,
            updatedAt: new Date(),
          })
          .where(eq(assetLabelTemplatesTable.id, existingTemplate.id))
          .returning();

        return updated;
      } else {
        // Create new template
        const [newTemplate] = await db
          .insert(assetLabelTemplatesTable)
          .values({
            tenantId: this.tenantId,
            isDefault: true,
            ...template,
          })
          .returning();

        return newTemplate;
      }
    } catch (error) {
      console.error("Error upserting asset label template:", error);
      throw error;
    }
  }
}

/**
 * Default configuration for new tenants
 */
export const DEFAULT_TENANT_CONFIG = {
  companyName: "Default Company",
  companyPrefix: "COMP",
  primaryColor: "#3B82F6",
  secondaryColor: "#1E40AF",
};

/**
 * Default asset label template
 */
export const DEFAULT_ASSET_LABEL_TEMPLATE = {
  templateName: "Standard Template",
  template: {
    companyPrefix: "COMP",
    assetTypeCode: "01",
    assetNumber: "0001",
    separator: "-",
    format: "{prefix}-{type}-{number}",
  } as AssetLabelTemplateConfig,
};

/**
 * Default asset types
 */
export const DEFAULT_ASSET_TYPES = [
  {
    typeCode: "01",
    typeName: "Mobile Phone",
    category: "Mobile",
    iconName: "phone",
  },
  {
    typeCode: "02",
    typeName: "Tablet",
    category: "Mobile",
    iconName: "tablet",
  },
  {
    typeCode: "03",
    typeName: "Desktop",
    category: "Computing",
    iconName: "desktop",
  },
  {
    typeCode: "04",
    typeName: "Laptop",
    category: "Computing",
    iconName: "laptop",
  },
  {
    typeCode: "05",
    typeName: "Monitor",
    category: "Peripherals",
    iconName: "monitor",
  },
];

/**
 * Default asset states
 */
export const DEFAULT_ASSET_STATES = [
  {
    stateCode: "AVAILABLE",
    stateName: "Available Stock",
    stateColor: "#3B82F6",
    stateOrder: 1,
    isStartState: true,
  },
  {
    stateCode: "SIGNED_OUT",
    stateName: "Signed Out",
    stateColor: "#0D9488",
    stateOrder: 2,
  },
  {
    stateCode: "BUILDING",
    stateName: "Building",
    stateColor: "#F97316",
    stateOrder: 3,
  },
  {
    stateCode: "READY_TO_GO",
    stateName: "Ready To Go Stock",
    stateColor: "#9333EA",
    stateOrder: 4,
  },
  {
    stateCode: "ISSUED",
    stateName: "Issued",
    stateColor: "#16A34A",
    stateOrder: 5,
    isEndState: true,
  },
];
