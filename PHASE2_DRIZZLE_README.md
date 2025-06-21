# Phase 2 - Asset Management System with Drizzle ORM + Supabase

## Overview

Phase 2 has been successfully converted from raw PostgreSQL to use **Drizzle ORM** with **Supabase** as the database provider. This provides a modern, type-safe database layer with excellent developer experience.

## 🗃️ Database Architecture

### Drizzle ORM Setup

The database layer has been completely restructured using Drizzle ORM:

- **Schema Definition**: `backend/lib/db/schema.ts` - All table definitions with TypeScript types
- **Database Connection**: `backend/lib/db/index.ts` - Supabase connection with pooling
- **Utility Functions**: `backend/lib/db/utils.ts` - Helper functions for common operations
- **Seeding**: `backend/lib/db/seed.ts` - Initial data population
- **Configuration**: `backend/drizzle.config.ts` - Drizzle Kit configuration

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
backend/
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
- Supabase account and project
- PostgreSQL database (via Supabase)

### Setup Steps

1. **Install Dependencies** (already done)

   ```bash
   cd backend
   yarn install
   ```

2. **Environment Configuration**
   Create `.env.local` in the backend directory:

   ```env
   DATABASE_URL="postgresql://postgres:[password]@db.[reference].supabase.co:5432/postgres"
   NODE_ENV="development"
   ```

   > **Note**: `drizzle-kit` (used for migrations) does not automatically load `.env.local` like Next.js does. The `drizzle.config.ts` file has been configured to load it explicitly, so you can keep your secrets in `.env.local` as is standard for Next.js projects.

3. **Generate and Push Schema**

   ```bash
   # Generate migration files
   yarn db:generate

   # Push schema to database (for development)
   yarn db:push

   # Or run migrations (for production)
   yarn db:migrate
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
