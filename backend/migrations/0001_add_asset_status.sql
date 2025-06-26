-- backend/migrations/0001_add_asset_status.sql
-- Migration: Add asset_status enum and status column to assets table

-- 1. Create the enum type
CREATE TYPE asset_status AS ENUM ('holding', 'active', 'retired');

-- 2. Add the status column to the assets table, defaulting to 'holding'
ALTER TABLE assets ADD COLUMN status asset_status NOT NULL DEFAULT 'holding';

-- 3. Set all existing assets to 'active' (since they are already in the system)
UPDATE assets SET status = 'active'; 
