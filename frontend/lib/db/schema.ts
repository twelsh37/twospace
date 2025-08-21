// backend/lib/db/schema.ts
// Drizzle ORM Schema for Asset Management System

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

import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// Enum definitions
export const assetTypeEnum = pgEnum("asset_type", [
  "MOBILE_PHONE",
  "TABLET",
  "DESKTOP",
  "LAPTOP",
  "MONITOR",
]);

export const assetStateEnum = pgEnum("asset_state", [
  "AVAILABLE", // Available Stock
  "SIGNED_OUT", // Signed Out for building/configuration
  "BUILDING", // Building and configured (phones, tablets, desktops, laptops only)
  "READY_TO_GO", // Ready To Go Stock (RTGS)
  "ISSUED", // Issued to individuals or locations
  "holding", // Added for imported/holding assets (dashboard and seed logic)
]);

export const assignmentTypeEnum = pgEnum("assignment_type", [
  "INDIVIDUAL",
  "SHARED",
]);

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USER"]);

export const assetStatusEnum = pgEnum("asset_status", [
  "HOLDING",
  "ACTIVE",
  "RECYCLED",
  "STOCK",
  "REPAIR", // Added to designate assets in repair condition
]);

// Enum for holding asset status
export const holdingAssetStatusEnum = pgEnum("holding_asset_status", [
  "pending", // Just imported, not yet processed
  "processed", // Moved to assets table
  "error", // Import/validation error
]);

// Departments table for department management per location
export const departmentsTable = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locationsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Users table for authentication and user management
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locationsTable.id),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departmentsTable.id),
  role: userRoleEnum("role").notNull().default("USER"),
  passwordHash: varchar("password_hash", { length: 255 }), // For future authentication
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Locations table for asset placement
export const locationsTable = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Assets table - main asset records
export const assetsTable = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetNumber: varchar("asset_number", { length: 10 }).unique(),
  type: assetTypeEnum("type").notNull(),
  state: assetStateEnum("state").notNull().default("AVAILABLE"),
  serialNumber: varchar("serial_number", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  purchasePrice: decimal("purchase_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locationsTable.id),
  assignmentType: assignmentTypeEnum("assignment_type")
    .notNull()
    .default("INDIVIDUAL"),
  assignedTo: varchar("assigned_to", { length: 255 }), // Person name for individual assignments
  employeeId: varchar("employee_id", { length: 50 }), // Employee ID for individual assignments
  department: varchar("department", { length: 255 }), // Department for assignments
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete
  status: assetStatusEnum("status").notNull().default("HOLDING"),
});

// Asset history for audit trail
export const assetHistoryTable = pgTable("asset_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assetsTable.id, { onDelete: "cascade" }),
  previousState: assetStateEnum("previous_state"),
  newState: assetStateEnum("new_state").notNull(),
  changedBy: uuid("changed_by")
    .notNull()
    .references(() => usersTable.id),
  changeReason: text("change_reason"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  details: jsonb("details"), // Additional change details
});

// Asset assignments for tracking individual/shared assignments
export const assetAssignmentsTable = pgTable("asset_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assetsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => usersTable.id), // For individual assignments
  locationId: uuid("location_id").references(() => locationsTable.id), // For shared/location assignments
  assignmentType: assignmentTypeEnum("assignment_type").notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
  assignedBy: uuid("assigned_by")
    .notNull()
    .references(() => usersTable.id),
  unassignedAt: timestamp("unassigned_at", { withTimezone: true }),
  notes: text("notes"),
});

// Asset sequence counter for generating asset numbers
export const assetSequencesTable = pgTable("asset_sequences", {
  assetType: assetTypeEnum("asset_type").primaryKey(),
  nextSequence: integer("next_sequence").notNull().default(1),
});

// Settings table for system-wide configuration (single row)
export const settingsTable = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportCacheDuration: integer("report_cache_duration").notNull().default(30), // in minutes
  // New: JSON column for global depreciation settings (method, years, percentages)
  depreciationSettings: jsonb("depreciation_settings"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Archived Assets table for storing deleted asset records
// REASONING: When an asset is deleted, it is moved here instead of being permanently removed. This allows for future audits, compliance, and traceability. All fields from 'assets' are preserved, plus archive metadata.
export const archivedAssetsTable = pgTable("archived_assets", {
  // All asset fields
  id: uuid("id").primaryKey(), // Keep original asset id for traceability
  assetNumber: varchar("asset_number", { length: 10 }),
  type: assetTypeEnum("type").notNull(),
  state: assetStateEnum("state").notNull(),
  serialNumber: varchar("serial_number", { length: 255 }).notNull(),
  description: text("description").notNull(),
  purchasePrice: decimal("purchase_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  locationId: uuid("location_id").notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  employeeId: varchar("employee_id", { length: 50 }),
  department: varchar("department", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  status: assetStatusEnum("status").notNull(),
  // Archive metadata
  archivedAt: timestamp("archived_at", { withTimezone: true }).defaultNow(), // When archived
  archivedBy: uuid("archived_by")
    .notNull()
    .references(() => usersTable.id), // Who archived
  archiveReason: text("archive_reason"), // Why archived
});

// Table for assets in holding (awaiting asset number assignment)
export const holdingAssetsTable = pgTable("holding_assets", {
  id: uuid("id").primaryKey().defaultRandom(), // Will become the asset's UUID in assets table
  serialNumber: varchar("serial_number", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  supplier: varchar("supplier", { length: 255 }), // Optional: supplier name
  importedBy: uuid("imported_by").references(() => usersTable.id), // Optional: who imported
  importedAt: timestamp("imported_at", { withTimezone: true }).defaultNow(),
  status: holdingAssetStatusEnum("status").notNull().default("pending"),
  rawData: jsonb("raw_data"), // Optional: original import row
  notes: text("notes"), // Optional: admin notes or error messages
});

// Roles table for assigning roles to users by email
// REASONING: This table allows associating a user (by email) with a role (Admin/User). Useful for role-based access control and migration compatibility.
export const rolesTable = pgTable("roles", {
  id: integer("id").primaryKey(), // Auto-incrementing integer ID
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(), // When the role was assigned
  userId: varchar("user_id", { length: 255 }).notNull(), // User's email address
  role: varchar("role", { length: 32 }).notNull(), // Role name (e.g., 'Admin', 'User')
});

// Type exports for use in application
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Location = typeof locationsTable.$inferSelect;
export type NewLocation = typeof locationsTable.$inferInsert;
export type Asset = typeof assetsTable.$inferSelect;
export type NewAsset = typeof assetsTable.$inferInsert;
export type AssetHistory = typeof assetHistoryTable.$inferSelect;
export type NewAssetHistory = typeof assetHistoryTable.$inferInsert;
export type AssetAssignment = typeof assetAssignmentsTable.$inferSelect;
export type NewAssetAssignment = typeof assetAssignmentsTable.$inferInsert;
export type Department = typeof departmentsTable.$inferSelect;
export type NewDepartment = typeof departmentsTable.$inferInsert;
export type ArchivedAsset = typeof archivedAssetsTable.$inferSelect;
export type NewArchivedAsset = typeof archivedAssetsTable.$inferInsert;
export type Role = typeof rolesTable.$inferSelect;
export type NewRole = typeof rolesTable.$inferInsert;
export type NewHoldingAsset = typeof holdingAssetsTable.$inferInsert;

// Configuration table types
export type TenantConfig = typeof tenantConfigsTable.$inferSelect;
export type NewTenantConfig = typeof tenantConfigsTable.$inferInsert;
export type AssetLabelTemplate = typeof assetLabelTemplatesTable.$inferSelect;
export type NewAssetLabelTemplate =
  typeof assetLabelTemplatesTable.$inferInsert;
export type CustomAssetType = typeof customAssetTypesTable.$inferSelect;
export type NewCustomAssetType = typeof customAssetTypesTable.$inferInsert;
export type CustomAssetState = typeof customAssetStatesTable.$inferSelect;
export type NewCustomAssetState = typeof customAssetStatesTable.$inferInsert;
export type StateTransitionRule = typeof stateTransitionRulesTable.$inferSelect;
export type NewStateTransitionRule =
  typeof stateTransitionRulesTable.$inferInsert;
export type BusinessRule = typeof businessRulesTable.$inferSelect;
export type NewBusinessRule = typeof businessRulesTable.$inferInsert;

// Configuration tables for multi-tenant support
export const tenantConfigsTable = pgTable("tenant_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().unique(), // Unique tenant identifier
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyPrefix: varchar("company_prefix", { length: 10 }).notNull(), // e.g., "AIAA"
  logoUrl: text("logo_url"), // Company logo URL
  primaryColor: varchar("primary_color", { length: 7 }), // Hex color code
  secondaryColor: varchar("secondary_color", { length: 7 }), // Hex color code
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Asset label template configuration
export const assetLabelTemplatesTable = pgTable("asset_label_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  template: jsonb("template").notNull(), // JSON structure defining the template
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Custom asset types per tenant
export const customAssetTypesTable = pgTable("custom_asset_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  typeCode: varchar("type_code", { length: 10 }).notNull(), // e.g., "01", "02"
  typeName: varchar("type_name", { length: 255 }).notNull(), // e.g., "Mobile Phone"
  category: varchar("category", { length: 100 }), // e.g., "Computing", "Mobile"
  iconName: varchar("icon_name", { length: 100 }), // Icon identifier
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Custom asset states per tenant
export const customAssetStatesTable = pgTable("custom_asset_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  stateCode: varchar("state_code", { length: 50 }).notNull(), // e.g., "AVAILABLE", "IN_TRANSIT"
  stateName: varchar("state_name", { length: 255 }).notNull(), // Display name
  stateColor: varchar("state_color", { length: 7 }).notNull(), // Hex color code
  stateOrder: integer("state_order").notNull(), // Order in workflow
  isStartState: boolean("is_start_state").notNull().default(false), // Is this "Available Stock"?
  isEndState: boolean("is_end_state").notNull().default(false), // Is this "Issued"?
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// State transition rules per tenant
export const stateTransitionRulesTable = pgTable("state_transition_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  assetTypeId: uuid("asset_type_id")
    .notNull()
    .references(() => customAssetTypesTable.id),
  fromStateId: uuid("from_state_id")
    .notNull()
    .references(() => customAssetStatesTable.id),
  toStateId: uuid("to_state_id")
    .notNull()
    .references(() => customAssetStatesTable.id),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  requiredFields: jsonb("required_fields"), // JSON array of required field names
  transitionNotes: text("transition_notes"), // Notes about this transition
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Business rules configuration
export const businessRulesTable = pgTable("business_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: varchar("rule_type", { length: 100 }).notNull(), // e.g., "auto_assignment", "notification"
  ruleConfig: jsonb("rule_config").notNull(), // JSON configuration for the rule
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
