-- Migration: Add Configuration Tables for Multi-Tenant Support
-- Created: 2025-08-21

-- Create tenant configs table
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

-- Create asset label templates table
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

-- Create custom asset types table
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

-- Create custom asset states table
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

-- Create state transition rules table
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

-- Create business rules table
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant_id ON tenant_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_asset_label_templates_tenant_id ON asset_label_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_asset_types_tenant_id ON custom_asset_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_asset_states_tenant_id ON custom_asset_states(tenant_id);
CREATE INDEX IF NOT EXISTS idx_state_transition_rules_tenant_id ON state_transition_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_rules_tenant_id ON business_rules(tenant_id);
