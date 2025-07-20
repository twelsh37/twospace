-- frontend/lib/db/optimize-indexes.sql
-- Database Indexing Script for Asset Management System
-- Optimizes Supabase PostgreSQL database for faster API query response times
--
-- This script creates strategic indexes based on common query patterns:
-- 1. Asset filtering and searching (type, state, location, assignedTo)
-- 2. User filtering and searching (department, role, email, name)
-- 3. Location filtering and searching (name, isActive)
-- 4. Asset history queries (assetId, timestamp, changedBy)
-- 5. Asset assignments queries (assetId, userId, locationId)
-- 6. Dashboard aggregation queries
-- 7. Search functionality across multiple tables

-- =============================================================================
-- ASSETS TABLE INDEXES
-- =============================================================================

-- Index for asset filtering by type, state, and location (most common filter combination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_type_state_location
ON assets (type, state, location_id)
WHERE deleted_at IS NULL;

-- Index for asset filtering by state and location (common dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_state_location
ON assets (state, location_id)
WHERE deleted_at IS NULL;

-- Index for asset filtering by type and state (common dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_type_state
ON assets (type, state)
WHERE deleted_at IS NULL;

-- Index for assigned assets (filters by assignedTo and employeeId)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_assigned
ON assets (assigned_to, employee_id, department)
WHERE deleted_at IS NULL AND assigned_to IS NOT NULL;

-- Index for unassigned assets (common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_unassigned
ON assets (assigned_to)
WHERE deleted_at IS NULL AND assigned_to IS NULL;

-- Index for asset search functionality (assetNumber, serialNumber, description)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_search
ON assets USING gin(to_tsvector('english',
    COALESCE(asset_number, '') || ' ' ||
    COALESCE(serial_number, '') || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(assigned_to, '')
))
WHERE deleted_at IS NULL;

-- Index for asset search with trigram similarity (for partial matches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_search_trigram
ON assets USING gin (
    asset_number gin_trgm_ops,
    serial_number gin_trgm_ops,
    description gin_trgm_ops,
    assigned_to gin_trgm_ops
)
WHERE deleted_at IS NULL;

-- Index for asset creation date (common sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_created_at
ON assets (created_at DESC)
WHERE deleted_at IS NULL;

-- Index for asset updates (common sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_updated_at
ON assets (updated_at DESC)
WHERE deleted_at IS NULL;

-- Index for soft delete filtering (all queries filter by deleted_at IS NULL)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_deleted_at
ON assets (deleted_at)
WHERE deleted_at IS NULL;

-- Index for purchase price aggregation (dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_purchase_price
ON assets (purchase_price)
WHERE deleted_at IS NULL;

-- =============================================================================
-- USERS TABLE INDEXES
-- =============================================================================

-- Index for user filtering by department and role (common filters)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_department_role
ON users (department, role)
WHERE is_active = true;

-- Index for user search functionality (name, email)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search
ON users USING gin(to_tsvector('english',
    COALESCE(name, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(employee_id, '')
))
WHERE is_active = true;

-- Index for user search with trigram similarity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_trigram
ON users USING gin (
    name gin_trgm_ops,
    email gin_trgm_ops,
    employee_id gin_trgm_ops
)
WHERE is_active = true;

-- Index for active users (common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active
ON users (is_active)
WHERE is_active = true;

-- Index for user creation date (common sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at
ON users (created_at DESC)
WHERE is_active = true;

-- =============================================================================
-- LOCATIONS TABLE INDEXES
-- =============================================================================

-- Index for location filtering by active status (common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_active
ON locations (is_active)
WHERE is_active = true;

-- Index for location search functionality (name)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_search
ON locations USING gin(to_tsvector('english', name))
WHERE is_active = true;

-- Index for location search with trigram similarity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_search_trigram
ON locations USING gin (name gin_trgm_ops)
WHERE is_active = true;

-- Index for location name sorting (common ordering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_name
ON locations (name)
WHERE is_active = true;

-- =============================================================================
-- ASSET HISTORY TABLE INDEXES
-- =============================================================================

-- Index for asset history by asset ID (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_history_asset_id
ON asset_history (asset_id, timestamp DESC);

-- Index for asset history by changed by user (common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_history_changed_by
ON asset_history (changed_by, timestamp DESC);

-- Index for recent activity queries (dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_history_timestamp
ON asset_history (timestamp DESC);

-- Index for asset history by state changes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_history_state_changes
ON asset_history (asset_id, new_state, timestamp DESC);

-- =============================================================================
-- ASSET ASSIGNMENTS TABLE INDEXES
-- =============================================================================

-- Index for asset assignments by asset ID (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_assignments_asset_id
ON asset_assignments (asset_id, assigned_at DESC);

-- Index for asset assignments by user ID
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_assignments_user_id
ON asset_assignments (user_id, assigned_at DESC)
WHERE user_id IS NOT NULL;

-- Index for asset assignments by location ID
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_assignments_location_id
ON asset_assignments (location_id, assigned_at DESC)
WHERE location_id IS NOT NULL;

-- Index for asset assignments by assignment type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_assignments_type
ON asset_assignments (assignment_type, assigned_at DESC);

-- Index for active assignments (not unassigned)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_assignments_active
ON asset_assignments (asset_id, assigned_at DESC)
WHERE unassigned_at IS NULL;

-- =============================================================================
-- COMPOSITE INDEXES FOR COMMON JOIN PATTERNS
-- =============================================================================

-- Index for assets with location joins (common in API responses)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_location_join
ON assets (location_id, asset_number)
WHERE deleted_at IS NULL;

-- Index for asset history with user joins (common in dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_history_user_join
ON asset_history (changed_by, asset_id, timestamp DESC);

-- =============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =============================================================================

-- Index for available assets (most common state filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_available
ON assets (type, location_id, created_at DESC)
WHERE deleted_at IS NULL AND state = 'AVAILABLE';

-- Index for issued assets (common state filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_issued
ON assets (assigned_to, department, location_id)
WHERE deleted_at IS NULL AND state = 'ISSUED';

-- Index for laptops (most common asset type)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_laptops
ON assets (state, location_id, created_at DESC)
WHERE deleted_at IS NULL AND type = 'LAPTOP';

-- =============================================================================
-- ENABLE TRIGRAM EXTENSION (if not already enabled)
-- =============================================================================

-- Enable the pg_trgm extension for trigram similarity searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- ANALYZE TABLES FOR BETTER QUERY PLANNING
-- =============================================================================

-- Update table statistics for better query planning
ANALYZE assets;
ANALYZE users;
ANALYZE locations;
ANALYZE asset_history;
ANALYZE asset_assignments;

-- =============================================================================
-- INDEX USAGE MONITORING QUERIES
-- =============================================================================

-- Query to check index usage (run after some time to see which indexes are being used)
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Query to find unused indexes (run after some time to identify unused indexes)
-- SELECT schemaname, tablename, indexname
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public' AND idx_scan = 0
-- ORDER BY tablename, indexname;

-- =============================================================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================================================

-- Create a view to monitor slow queries (requires pg_stat_statements extension)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
--
-- CREATE OR REPLACE VIEW slow_queries AS
-- SELECT
--     query,
--     calls,
--     total_time,
--     mean_time,
--     rows
-- FROM pg_stat_statements
-- WHERE query LIKE '%assets%' OR query LIKE '%users%' OR query LIKE '%locations%'
-- ORDER BY mean_time DESC
-- LIMIT 20;