# Phase 2 - Asset Management System with Drizzle ORM + Neon Postgres

## Overview

Phase 2 has been successfully converted from raw PostgreSQL to use **Drizzle ORM** with **Neon Postgres** as the database provider. This provides a modern, type-safe database layer with excellent developer experience.

## 🗃️ Database Architecture

### Drizzle ORM Setup

The database layer has been completely restructured using Drizzle ORM:

- **Schema Definition**: `frontend/lib/db/schema.ts` - All table definitions with TypeScript types
- **Database Connection**: `frontend/lib/db/index.ts` - Neon Postgres connection with pooling
- **Utility Functions**: `frontend/lib/db/utils.ts` - Helper functions for common operations
- **Seeding**: `frontend/lib/db/seed.ts` - Initial data population
- **Configuration**: `frontend/drizzle.config.ts` - Drizzle Kit configuration

### Database Tables

#### Core Tables

- **users** - System users with roles and authentication
- **locations** - Physical locations within the organization
- **assets** - Main asset records with lifecycle management
- **asset_history** - Complete audit trail for all asset changes
- **asset_assignments** - Individual and shared asset assignments
- **asset_sequences** - Auto-incrementing sequences for asset number generation

#### Database Features

- **UUID Primary Keys** - For all tables
- **Soft Delete** - Assets use `deletedAt` timestamp instead of hard deletion
- **Automatic Timestamps** - `createdAt` and `updatedAt` on all records
- **Type-Safe Enums** - Asset types, states, assignment types, user roles
- **Foreign Key Relations** - Proper relationships between tables
- **JSONB Support** - For flexible data storage in history details

## 📝 Database Schema with Drizzle ORM

The database schema for this project is defined in [`frontend/lib/db/schema.ts`], using [Drizzle ORM](https://orm.drizzle.team/docs/overview) for type-safe, programmatic schema management. This file is the single source of truth for all database tables, enums, and type exports used throughout the application.

### Structure of schema.ts

- **Enum Definitions**: All enums (such as asset types, states, assignment types, user roles, and asset status) are defined using Drizzle's `pgEnum` helper. This ensures type safety and consistency across the app and database.
- **Table Definitions**: Each table is defined using Drizzle's `pgTable` API, specifying columns, types, constraints, and relationships. All core tables (users, locations, assets, asset_history, asset_assignments, asset_sequences) are defined here.
- **Type Exports**: At the end of the file, TypeScript types are exported using Drizzle's `$inferSelect` and `$inferInsert` helpers. This allows you to use fully type-safe objects in your application code and API routes.

### Example: Enum and Table Definition

```typescript
// Enum for asset types
export const assetTypeEnum = pgEnum("asset_type", [
  "MOBILE_PHONE",
  "TABLET",
  "DESKTOP",
  "LAPTOP",
  "MONITOR",
]);

// Table for assets
export const assetsTable = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetNumber: varchar("asset_number", { length: 10 }).unique(),
  type: assetTypeEnum("type").notNull(),
  // ... other columns ...
});
```

### Example: Type Inference

```typescript
// Use inferred types for type-safe queries
import { assetsTable } from "@/lib/db/schema";

export type Asset = typeof assetsTable.$inferSelect;
export type NewAsset = typeof assetsTable.$inferInsert;

// Example usage in a query
const assets: Asset[] = await db.select().from(assetsTable);
```

### Extending the Schema

- To add a new table or column, edit `schema.ts` and use Drizzle's API.
- After making changes, generate a migration with:
  ```bash
  yarn db:generate
  ```
- Review and apply the migration as described in the [Migration Workflow](#migration-workflow) section.

### Why Drizzle ORM?

- **Type Safety**: All schema definitions and queries are fully type-checked by TypeScript.
- **Single Source of Truth**: The schema file is the only place you need to update for database changes.
- **Easy Migrations**: Drizzle Kit generates migration files based on changes to `schema.ts`.
- **Developer Experience**: Autocomplete, refactoring, and error checking are all improved.

For more details, see the comments in [`frontend/lib/db/schema.ts`].

## 🔧 Key Features Implemented

### 1. Asset Number Generation

```typescript
// Automatic generation: 01-00001, 02-00001, etc.
const assetNumber = await generateAssetNumber("MOBILE_PHONE");
```

### 2. Audit Trail System

```typescript
// Every change is automatically logged
await createAssetHistory(
  assetId,
  newState,
  userId,
  reason,
  previousState,
  details
);
```

### 3. Type-Safe Database Operations

```typescript
// Full TypeScript support throughout
const assets: Asset[] = await getActiveAssets({
  type: "LAPTOP",
  state: "AVAILABLE",
});
```

### 4. Advanced Filtering & Search

- Type-based filtering
- State-based filtering
- Location-based filtering
- Full-text search across multiple fields
- Pagination support

## 📁 File Structure

```
frontend/
├── lib/
│   └── db/
│       ├── schema.ts      # Drizzle schema definitions
│       ├── index.ts       # Database connection setup
│       ├── utils.ts       # Database utility functions
│       └── seed.ts        # Database seeding script
├── app/
│   └── api/
│       └── assets/
│           └── route.ts   # Updated API routes using Drizzle
├── drizzle.config.ts      # Drizzle Kit configuration
└── package.json           # Added Drizzle scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Neon Postgres account and project
- PostgreSQL database (via Neon)

### Setup Steps

1. **Install Dependencies** (already done)

   ```bash
   cd frontend
   yarn install
   ```

2. **Environment Configuration**
   Create `.env.local` in the frontend directory:

   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host].neon.tech:5432/postgres"
   NODE_ENV="development"
   ```

   > **Note**: `drizzle-kit` (used for migrations) does not automatically load `.env.local` like Next.js does. The `drizzle.config.ts` file has been configured to load it explicitly, so you can keep your secrets in `.env.local` as is standard for Next.js projects.

3. **Generate and Push Schema**

   ```bash
   # Generate migration files
   yarn db:generate
   ```

4. **Seed Initial Data**

   ```bash
   yarn db:seed
   ```

5. **Start Development Server**
   ```bash
   yarn dev
   ```

### Available Database Scripts

```json
{
  "db:generate": "drizzle-kit generate", // Generate migration files
  "db:migrate": "drizzle-kit migrate", // Run migrations
  "db:push": "drizzle-kit push", // Push schema (development)
  "db:studio": "drizzle-kit studio", // Database GUI
  "db:seed": "tsx lib/db/seed.ts" // Populate initial data
}
```

## 🗄️ Database Schema Details

### Asset Types & Numbering

- **01-XXXXX**: Mobile Phones
- **02-XXXXX**: Tablets
- **03-XXXXX**: Desktops
- **04-XXXXX**: Laptops
- **05-XXXXX**: Monitors

### Asset States & Lifecycle

- **AVAILABLE** → **SIGNED_OUT** → **BUILT** → **READY_TO_GO** → **ISSUED**
- Monitors skip the **BUILT** state
- All transitions are tracked in `asset_history`

### Assignment Types

- **INDIVIDUAL**: Assigned to specific person (name, employee ID, department)
- **SHARED**: Assigned to location for shared use

## 🔌 API Endpoints

### GET /api/assets

Retrieve assets with filtering and pagination:

```typescript
// Query parameters
type AssetFilters = {
  type?: "all" | "MOBILE_PHONE" | "TABLET" | "DESKTOP" | "LAPTOP" | "MONITOR";
  state?:
    | "all"
    | "AVAILABLE"
    | "SIGNED_OUT"
    | "BUILT"
    | "READY_TO_GO"
    | "ISSUED";
  locationId?: string | "all";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
```

### POST /api/assets

Create new asset:

```typescript
type CreateAssetRequest = {
  type: AssetType;
  serialNumber: string;
  description: string;
  purchasePrice: number;
  locationId: string;
  assignmentType?: "INDIVIDUAL" | "SHARED";
  assignedTo?: string;
  employeeId?: string;
  department?: string;
};
```

### PUT /api/assets

Bulk operations:

```typescript
type BulkUpdateRequest = {
  assetIds: string[];
  operation: "stateTransition" | "bulkUpdate";
  newState?: AssetState;
  updateData?: Partial<Asset>;
  reason?: string;
};
```

## 🛡️ Type Safety

All database operations are fully type-safe:

```typescript
// Inferred types from schema
type User = typeof usersTable.$inferSelect;
type NewUser = typeof usersTable.$inferInsert;
type Asset = typeof assetsTable.$inferSelect;
type NewAsset = typeof assetsTable.$inferInsert;

// Type-safe queries
const assets: Asset[] = await db.select().from(assetsTable);
const newAsset: Asset = await db
  .insert(assetsTable)
  .values(newAssetData)
  .returning()[0];
```

## 🔍 Database Management

### Drizzle Studio

Launch the database GUI:

```bash
yarn db:studio
```

Access at `https://local.drizzle.studio`

### Migration Workflow

```bash
# 1. Modify schema in schema.ts
# 2. Generate migration
yarn db:generate

# 3. Review generated migration in drizzle/ folder
# 4. Apply migration
yarn db:migrate

# For development, use push instead:
yarn db:push
```

## Logging and Database Audit

All database operations, migrations, and audit trail events are logged server-side using Winston. Logs are stored in `frontend/logs/` with daily rotation and 30-day retention. There are separate logs for system and application events.

- **Admins**: Use logs to audit database changes, investigate errors, and monitor system health.
- **Users**: If you encounter database issues, provide the relevant log file to admins for troubleshooting.
- **Log Location**: `frontend/logs/`

This logging system supports database troubleshooting, audit trails, and compliance.
