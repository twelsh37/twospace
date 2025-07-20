-- frontend/supabase-migration.sql
-- Complete database migration script for Supabase Asset Management System
-- Run this in your Supabase SQL Editor to set up the complete schema

-- =============================================================================
-- ENUM DEFINITIONS
-- =============================================================================

-- Asset types enum
CREATE TYPE asset_type AS ENUM (
  'MOBILE_PHONE',
  'TABLET',
  'DESKTOP',
  'LAPTOP',
  'MONITOR'
);

-- Asset states enum
CREATE TYPE asset_state AS ENUM (
  'AVAILABLE',
  'SIGNED_OUT',
  'BUILDING',
  'READY_TO_GO',
  'ISSUED'
);

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'USER'
);

-- Asset history change types enum
CREATE TYPE change_type AS ENUM (
  'CREATED',
  'UPDATED',
  'STATE_CHANGED',
  'ASSIGNED',
  'UNASSIGNED',
  'DELETED'
);

-- =============================================================================
-- TABLE DEFINITIONS
-- =============================================================================

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (will be extended by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  location_id UUID NOT NULL REFERENCES locations(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  role user_role NOT NULL DEFAULT 'USER',
  password_hash VARCHAR(255), -- For legacy compatibility
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset sequences table
CREATE TABLE asset_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type asset_type NOT NULL UNIQUE,
  next_sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_number VARCHAR(50) NOT NULL UNIQUE,
  type asset_type NOT NULL,
  description TEXT NOT NULL,
  serial_number VARCHAR(255),
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  state asset_state NOT NULL DEFAULT 'AVAILABLE',
  location_id UUID NOT NULL REFERENCES locations(id),
  assigned_to VARCHAR(255), -- Email of assigned user
  employee_id VARCHAR(50), -- Employee ID of assigned user
  department VARCHAR(255), -- Department of assigned user
  notes TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset history table
CREATE TABLE asset_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  changed_by VARCHAR(255) NOT NULL, -- Email of user who made the change
  change_type change_type NOT NULL,
  previous_state VARCHAR(50),
  new_state VARCHAR(50),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_cache_duration INTEGER NOT NULL DEFAULT 30,
  depreciation_settings JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Asset filtering indexes
CREATE INDEX idx_assets_type_state_location ON assets (type, state, location_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_state_location ON assets (state, location_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_type_state ON assets (type, state) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_assigned ON assets (assigned_to, employee_id, department) WHERE deleted_at IS NULL AND assigned_to IS NOT NULL;
CREATE INDEX idx_assets_unassigned ON assets (assigned_to) WHERE deleted_at IS NULL AND assigned_to IS NULL;

-- Asset search indexes
CREATE INDEX idx_assets_search ON assets USING gin(to_tsvector('english', asset_number || ' ' || description || ' ' || COALESCE(serial_number, ''))) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_asset_number ON assets (asset_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_serial_number ON assets (serial_number) WHERE deleted_at IS NULL;

-- User filtering indexes
CREATE INDEX idx_users_department ON users (department_id) WHERE is_active = true;
CREATE INDEX idx_users_role ON users (role) WHERE is_active = true;
CREATE INDEX idx_users_email ON users (email) WHERE is_active = true;
CREATE INDEX idx_users_employee_id ON users (employee_id) WHERE is_active = true;

-- Location and department indexes
CREATE INDEX idx_locations_active ON locations (is_active);
CREATE INDEX idx_departments_location ON departments (location_id);

-- Asset history indexes
CREATE INDEX idx_asset_history_asset_id ON asset_history (asset_id);
CREATE INDEX idx_asset_history_changed_by ON asset_history (changed_by);
CREATE INDEX idx_asset_history_created_at ON asset_history (created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Locations policies
CREATE POLICY "Locations are viewable by authenticated users" ON locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Locations are insertable by admins" ON locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

CREATE POLICY "Locations are updatable by admins" ON locations
  FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

-- Departments policies
CREATE POLICY "Departments are viewable by authenticated users" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Departments are insertable by admins" ON departments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

CREATE POLICY "Departments are updatable by admins" ON departments
  FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

-- Users policies
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users are insertable by admins" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

CREATE POLICY "Users are updatable by admins or self" ON users
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN') OR
      users.email = auth.email()
    )
  );

-- Assets policies
CREATE POLICY "Assets are viewable by authenticated users" ON assets
  FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Assets are insertable by authenticated users" ON assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Assets are updatable by authenticated users" ON assets
  FOR UPDATE USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Assets are deletable by admins" ON assets
  FOR DELETE USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

-- Asset history policies
CREATE POLICY "Asset history is viewable by authenticated users" ON asset_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Asset history is insertable by authenticated users" ON asset_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Asset sequences policies
CREATE POLICY "Asset sequences are viewable by authenticated users" ON asset_sequences
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Asset sequences are updatable by authenticated users" ON asset_sequences
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Settings policies
CREATE POLICY "Settings are viewable by authenticated users" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Settings are updatable by admins" ON settings
  FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.email = auth.email() AND users.role = 'ADMIN'
  ));

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_sequences_updated_at BEFORE UPDATE ON asset_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert default asset sequences
INSERT INTO asset_sequences (asset_type, next_sequence) VALUES
  ('MOBILE_PHONE', 1),
  ('TABLET', 1),
  ('DESKTOP', 1),
  ('LAPTOP', 1),
  ('MONITOR', 1)
ON CONFLICT (asset_type) DO NOTHING;

-- Insert default settings
INSERT INTO settings (report_cache_duration, depreciation_settings) VALUES
  (30, '{"method": "straight", "years": 4, "decliningPercents": [50, 25, 12.5, 12.5]}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SUPABASE AUTH INTEGRATION
-- =============================================================================

-- Create a trigger to sync Supabase auth users with our users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a new user signs up
  -- We'll handle user creation in our application logic
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();