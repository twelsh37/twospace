// frontend/scripts/seed-configuration-data.ts

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

/**
 * Seed Configuration Data Script
 *
 * This script populates the configuration tables with default data.
 * Run this after creating the tables with the migration.
 *
 * Usage: yarn tsx scripts/seed-configuration-data.ts
 */

import { db } from "../lib/db";
import {
  tenantConfigsTable,
  assetLabelTemplatesTable,
  customAssetTypesTable,
  customAssetStatesTable,
  stateTransitionRulesTable,
} from "../lib/db/schema";
import {
  DEFAULT_TENANT_CONFIG,
  DEFAULT_ASSET_LABEL_TEMPLATE,
  DEFAULT_ASSET_TYPES,
  DEFAULT_ASSET_STATES,
} from "../lib/config-service";

/**
 * Seed default configuration for existing tenants
 */
async function seedDefaultConfiguration() {
  console.log("Seeding default configuration...");

  try {
    // For now, we'll create a default tenant configuration
    // In a real multi-tenant setup, you'd iterate through existing tenants
    const defaultTenantId = "default";

    // Create default tenant config
    const [tenantConfig] = await db
      .insert(tenantConfigsTable)
      .values({
        tenantId: defaultTenantId,
        ...DEFAULT_TENANT_CONFIG,
      })
      .returning();

    console.log("✅ Default tenant config created:", tenantConfig.id);

    // Create default asset label template
    const [labelTemplate] = await db
      .insert(assetLabelTemplatesTable)
      .values({
        tenantId: defaultTenantId,
        ...DEFAULT_ASSET_LABEL_TEMPLATE,
      })
      .returning();

    console.log("✅ Default asset label template created:", labelTemplate.id);

    // Create default asset types
    const assetTypes = await db
      .insert(customAssetTypesTable)
      .values(
        DEFAULT_ASSET_TYPES.map((type) => ({
          tenantId: defaultTenantId,
          ...type,
        }))
      )
      .returning();

    console.log(`✅ ${assetTypes.length} default asset types created`);

    // Create default asset states
    const assetStates = await db
      .insert(customAssetStatesTable)
      .values(
        DEFAULT_ASSET_STATES.map((state) => ({
          tenantId: defaultTenantId,
          ...state,
        }))
      )
      .returning();

    console.log(`✅ ${assetStates.length} default asset states created`);

    // Create state transition rules
    const transitionRules = [];
    for (const assetType of assetTypes) {
      for (let i = 0; i < assetStates.length - 1; i++) {
        const fromState = assetStates[i];
        const toState = assetStates[i + 1];

        // Skip BUILDING state for monitors (as per current logic)
        if (assetType.typeCode === "05" && toState.stateCode === "BUILDING") {
          continue;
        }

        transitionRules.push({
          tenantId: defaultTenantId,
          assetTypeId: assetType.id,
          fromStateId: fromState.id,
          toStateId: toState.id,
          requiresApproval: false,
          requiredFields: [],
        });
      }
    }

    if (transitionRules.length > 0) {
      await db.insert(stateTransitionRulesTable).values(transitionRules);
      console.log(
        `✅ ${transitionRules.length} state transition rules created`
      );
    }

    console.log("✅ Default configuration seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding default configuration:", error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting configuration data seeding...");

  try {
    await seedDefaultConfiguration();
    console.log("🎉 Configuration data seeding completed successfully!");
  } catch (error) {
    console.error("💥 Configuration data seeding failed:", error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  main().catch(console.error);
}
