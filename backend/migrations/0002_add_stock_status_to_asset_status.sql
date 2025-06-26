-- backend/migrations/0002_add_stock_status_to_asset_status.sql
-- Migration: Add 'stock' value to asset_status enum

ALTER TYPE asset_status ADD VALUE IF NOT EXISTS 'stock'; 
