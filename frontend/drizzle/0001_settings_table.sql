-- frontend/drizzle/0001_settings_table.sql
-- Migration: Create settings table for system-wide configuration

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_cache_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
); 
