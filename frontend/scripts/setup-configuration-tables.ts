// frontend/scripts/setup-configuration-tables.ts

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
 * Setup Configuration Tables Migration Script
 *
 * This script creates the new configuration tables for multi-tenant support
 * and seeds them with default data. Run this after deploying the new schema.
 *
 * Usage: yarn tsx scripts/setup-configuration-tables.ts
 */

import { db } from "../lib/db";
import {
  tenantConfigsTable,
  assetLabelTemplatesTable,
  customAssetTypesTable,
  customAssetStatesTable,
  stateTransitionRulesTable,
  businessRulesTable,
} from "../lib/db/schema";
import {
  DEFAULT_TENANT_CONFIG,
  DEFAULT_ASSET_LABEL_TEMPLATE,
  DEFAULT_ASSET_TYPES,
  DEFAULT_ASSET_STATES,
} from "../lib/config-service";

/**
 * Create configuration tables if they don't exist
 */
async function createConfigurationTables() {
  console.log("Creating configuration tables...");

  try {
    // Create tenant configs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tenant_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        company_prefix VARCHAR(10) NOT NULL,
        logo_url TEXT,
        primary_color VARCHAR(7),
        secondary_color VARCHAR(7),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create asset label templates table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS asset_label_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        template JSONB NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create custom asset types table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS custom_asset_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        type_code VARCHAR(10) NOT NULL,
        type_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        icon_name VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create custom asset states table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS custom_asset_states (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        state_code VARCHAR(50) NOT NULL,
        state_name VARCHAR(255) NOT NULL,
        state_color VARCHAR(7) NOT NULL,
        state_order INTEGER NOT NULL,
        is_start_state BOOLEAN NOT NULL DEFAULT false,
        is_end_state BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create state transition rules table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS state_transition_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        asset_type_id UUID NOT NULL REFERENCES custom_asset_types(id),
        from_state_id UUID NOT NULL REFERENCES custom_asset_states(id),
        to_state_id UUID NOT NULL REFERENCES custom_asset_states(id),
        requires_approval BOOLEAN NOT NULL DEFAULT false,
        required_fields JSONB,
        transition_notes TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create business rules table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS business_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        rule_name VARCHAR(255) NOT NULL,
        rule_type VARCHAR(100) NOT NULL,
        rule_config JSONB NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("✅ Configuration tables created successfully");
  } catch (error) {
    console.error("❌ Error creating configuration tables:", error);
    throw error;
  }
}

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
 * Main migration function
 */
async function main() {
  console.log("🚀 Starting configuration tables setup...");

  try {
    await createConfigurationTables();
    await seedDefaultConfiguration();

    console.log("🎉 Configuration tables setup completed successfully!");
  } catch (error) {
    console.error("💥 Configuration tables setup failed:", error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}
