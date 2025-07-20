-- backend/scripts/drop-all-tables.sql
-- Drop all tables (order matters due to FKs)
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS asset_history CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS asset_sequences CASCADE;


-- Drop enums
DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS asset_state CASCADE;
DROP TYPE IF EXISTS asset_type CASCADE;
DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE; 
