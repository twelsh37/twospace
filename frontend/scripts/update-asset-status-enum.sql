-- Update asset_status enum from 'retired' to 'recycled'
-- This script manually updates the PostgreSQL enum

-- First, update any existing 'retired' values to 'recycled'
UPDATE assets SET status = 'recycled' WHERE status = 'retired';
UPDATE archived_assets SET status = 'recycled' WHERE status = 'retired';

-- Drop the old enum type
DROP TYPE IF EXISTS asset_status;

-- Create the new enum type with 'recycled' instead of 'retired'
CREATE TYPE asset_status AS ENUM('holding', 'active', 'recycled', 'stock');

-- Update the column types to use the new enum
ALTER TABLE assets ALTER COLUMN status TYPE asset_status USING status::text::asset_status;
ALTER TABLE archived_assets ALTER COLUMN status TYPE asset_status USING status::text::asset_status;

-- Set default values
ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'holding';
ALTER TABLE archived_assets ALTER COLUMN status SET DEFAULT 'holding';