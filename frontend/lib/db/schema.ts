// backend/lib/db/schema.ts
// Drizzle ORM Schema for Asset Management System

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
  "holding",
  "active",
  "retired",
  "stock",
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
  status: assetStatusEnum("status").notNull().default("holding"),
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
