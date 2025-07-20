# Admin Guide - TwoSpace Asset Management System

<!--
Filepath: frontend/documentation/ADMIN_GUIDE.md
This is the main admin guide for the TwoSpace Asset Management System.
It provides detailed instructions for installation, configuration, and administration.
-->

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Setup](#2-system-setup)
3. [User Management](#3-user-management)
4. [Data Management](#4-data-management)
5. [System Maintenance](#5-system-maintenance)
6. [Security](#6-security)
7. [Scaling and Performance](#7-scaling-and-performance)
8. [Advanced Topics](#8-advanced-topics)
9. [Appendix](#9-appendix)

## 1. Introduction

### Purpose of This Guide

This guide is designed for system administrators and IT professionals responsible for setting up, configuring, and maintaining the TwoSpace Asset Management System. It covers all aspects of system administration from initial installation to ongoing maintenance.

### Who Should Use This Guide

- **System Administrators**: Setting up and configuring the application
- **IT Managers**: Managing users, assets, and system policies
- **Database Administrators**: Managing data and performing maintenance
- **DevOps Engineers**: Deployment and infrastructure management

### System Overview

TwoSpace is a web-based asset management system built with:
- **Frontend**: Next.js 15 with TypeScript and Shadcn/ui
- **Backend**: Next.js API routes with Drizzle ORM
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (serverless)

## 2. System Setup

### Prerequisites

- Node.js 18 or higher
- Yarn package manager
- Supabase account and project
- Git for version control

### Installation Steps

#### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd twospace/frontend

# Install dependencies
yarn install
```

#### Step 2: Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Environment
NODE_ENV=development
```

#### Step 3: Supabase Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://app.supabase.com/)
   - Create a new project
   - Note your project URL and anon key

2. **Database Migration**
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste the contents of `supabase-migration.sql`
   - Execute the migration script

3. **Authentication Configuration**
   - Go to Authentication > Settings
   - Set your site URL (e.g., `http://localhost:3000` for development)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`

#### Step 4: Initial Admin User

1. **Create Admin User in Supabase**
   - Go to Authentication > Users
   - Click "Create user"
   - Enter admin email and password
   - Set user metadata: `{"role": "admin"}`

2. **Alternative: Use Setup Script**
   ```bash
   # Add service role key to .env.local first
   node scripts/setup-demo-user.js
   ```

#### Step 5: Start Development Server

```bash
yarn dev
```

Navigate to `http://localhost:3000` and log in with your admin credentials.

### Production Deployment

#### Vercel Deployment

1. **Connect Repository**
   - Connect your Git repository to Vercel
   - Set build command: `yarn build`
   - Set output directory: `.next`

2. **Environment Variables**
   - Add all environment variables from `.env.local` to Vercel
   - Update Supabase redirect URLs to your production domain

3. **Database Setup**
   - Ensure Supabase project is configured for production
   - Run any pending migrations

## 3. User Management

### User Roles and Permissions

#### Admin Role
- Full CRUD operations on all assets, users, and locations
- System configuration access
- User management capabilities
- Report generation and export

#### User Role
- View-only access to assets and locations
- Cannot access user management
- Cannot modify system data

### Managing Users

#### Adding Users

**Via Supabase Dashboard:**
1. Go to Authentication > Users
2. Click "Invite user" or "Create user"
3. Set email and password
4. Configure user metadata for role assignment

**Via Application (Admin Only):**
1. Navigate to Users page
2. Click "Add User"
3. Fill in user details
4. Assign appropriate role

#### User Role Assignment

Users are assigned roles through Supabase Auth metadata:

```json
{
  "role": "admin"  // or "user"
}
```

#### Password Management

- Users can reset passwords via the application
- Admins can reset passwords via Supabase Dashboard
- Password policies are enforced by Supabase

### Bulk User Import

1. Prepare CSV file with columns: name, email, employee_id, department
2. Navigate to Imports page
3. Select "Users" import type
4. Upload CSV file
5. Map columns and import

## 4. Data Management

### Asset Management

#### Asset Lifecycle States

**For Devices (Phones, Laptops, Desktops, Tablets):**
- Holding → Available Stock → Signed Out → Building → Ready to Go → Issued

**For Monitors:**
- Holding → Available Stock → Signed Out → Issued

#### Asset Numbering System

Assets are automatically assigned numbers with type prefixes:
- 01: Mobile Phone
- 02: Tablet
- 03: Desktop
- 04: Laptop
- 05: Monitor

Format: `XX-YYYYY` (prefix + 5-digit sequence)

#### Bulk Asset Import

1. Prepare CSV/Excel file with asset data
2. Navigate to Imports page
3. Select "Assets" import type
4. Upload file and map columns
5. Review and confirm import

### Location Management

#### Default Locations

The system comes with 10 predefined locations:
- IT Department - Store room
- IT Department - Workshop
- IT Department - Office
- HR Department
- Finance Department
- Marketing Department
- Sales Department
- Operations Department
- Warehouse
- Remote Location

#### Adding Custom Locations

1. Navigate to Locations page
2. Click "Add Location"
3. Enter location details
4. Save location

### Data Export

#### Asset Inventory Reports

1. Navigate to Reports page
2. Select "Asset Inventory"
3. Apply filters as needed
4. Click "Export PDF"
5. Download generated report

#### Data Export Options

- **PDF Reports**: Asset inventory with charts and tables
- **CSV Export**: Raw data for external analysis
- **Excel Export**: Formatted data for spreadsheet applications

## 5. System Maintenance

### Database Maintenance

#### Running Migrations

```bash
# Generate new migration
yarn db:generate

# Apply migrations
yarn db:migrate

# Seed database
yarn db:seed
```

#### Database Optimization

The system includes optimized indexes for common queries:
- Asset searches by type, state, and location
- User lookups by email and employee ID
- Location-based asset queries

### Logging and Monitoring

#### Console Logging

All system events are logged to the console for Vercel compatibility:
- API request/response logging
- Error tracking and debugging
- User activity monitoring
- System performance metrics

#### Accessing Logs

- **Development**: View console output in terminal
- **Production**: Access logs via Vercel Dashboard > Functions > Logs

### Backup and Recovery

#### Database Backups

Supabase provides automatic daily backups:
- 7 days of daily backups
- Point-in-time recovery
- Cross-region backup replication

#### Manual Backups

```sql
-- Export specific tables
pg_dump -t assets -t users -t locations your_database > backup.sql
```

### Performance Monitoring

#### Key Metrics to Monitor

- API response times
- Database query performance
- User session duration
- Asset state transition frequency
- Import/export operation success rates

## 6. Security

### Authentication Security

#### Supabase Auth Features

- Email/password authentication
- Email verification (optional)
- Password reset functionality
- Session management
- Rate limiting

#### Security Best Practices

1. **Strong Passwords**: Enforce minimum password requirements
2. **Email Verification**: Enable email confirmation for new users
3. **Session Management**: Configure appropriate session timeouts
4. **Rate Limiting**: Monitor and adjust rate limits as needed

### Authorization

#### Role-Based Access Control

- Admin users have full system access
- Standard users have read-only access to assets and locations
- API endpoints enforce role-based permissions
- UI components hide unauthorized actions

#### API Security

- All API routes require authentication
- Role-based authorization on protected endpoints
- Input validation and sanitization
- SQL injection prevention via Drizzle ORM

### Data Protection

#### Sensitive Data Handling

- Passwords are hashed by Supabase Auth
- Personal data is encrypted in transit
- Database connections use SSL/TLS
- API keys are stored securely in environment variables

## 7. Scaling and Performance

### Horizontal Scaling

The application is designed for horizontal scaling:
- Serverless architecture via Vercel
- Stateless API design
- Database connection pooling
- CDN for static assets

### Performance Optimization

#### Database Optimization

- Optimized indexes for common queries
- Query optimization for large datasets
- Connection pooling for efficient resource usage
- Caching strategies for frequently accessed data

#### Frontend Optimization

- Code splitting and lazy loading
- Optimized bundle sizes
- Static asset optimization
- Responsive design for mobile devices

### Load Balancing

- Vercel provides automatic load balancing
- Global CDN distribution
- Automatic scaling based on demand
- Health checks and failover

## 8. Advanced Topics

### Custom Configuration

#### Environment Variables

Additional configuration options:

```env
# Optional: Custom API endpoints
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_BARCODE_SCANNING=true
NEXT_PUBLIC_ENABLE_BULK_IMPORT=true
```

#### Custom Filters and Enums

To add custom asset types or states:

1. Update database schema
2. Modify TypeScript types
3. Update UI components
4. Add migration scripts

### Integration Options

#### External System Integration

The system can be integrated with:
- HR systems for user data synchronization
- Procurement systems for asset import
- Accounting systems for cost tracking
- Help desk systems for asset requests

#### API Integration

RESTful API endpoints available for:
- Asset CRUD operations
- User management
- Report generation
- Data import/export

### Automation and Scripts

#### Available Scripts

```bash
# Database management
yarn db:generate    # Generate new migration
yarn db:migrate     # Apply migrations
yarn db:seed        # Seed database

# Development
yarn dev            # Start development server
yarn build          # Build for production
yarn test           # Run tests
yarn lint           # Run ESLint
```

#### Custom Scripts

Create custom scripts in the `scripts/` directory for:
- Data migration
- Bulk operations
- System maintenance
- Reporting automation

## 9. Appendix

### Configuration Files

#### package.json
Main project configuration with dependencies and scripts.

#### tsconfig.json
TypeScript configuration for type checking and compilation.

#### tailwind.config.ts
Tailwind CSS configuration for styling.

#### drizzle.config.ts
Database ORM configuration for Drizzle.

### Useful Commands

#### Windows PowerShell

```powershell
# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Database operations
yarn db:migrate
```

#### Database Commands

```sql
-- Check asset counts by state
SELECT state, COUNT(*) FROM assets GROUP BY state;

-- Find assets by user
SELECT * FROM assets WHERE assigned_to = 'user_id';

-- Export asset data
SELECT * FROM assets WHERE deleted_at IS NULL;
```

### Support and Troubleshooting

#### Common Issues

1. **Authentication Problems**
   - Verify Supabase credentials in environment variables
   - Check redirect URLs in Supabase settings
   - Ensure user exists in Supabase Auth

2. **Database Connection Issues**
   - Verify Supabase project is active
   - Check database migration status
   - Review connection string format

3. **Build Errors**
   - Run `yarn install` to ensure dependencies are installed
   - Check TypeScript errors with `yarn lint`
   - Verify environment variables are set

#### Getting Help

- Check the application logs for error details
- Review the CHANGELOG.md for recent changes
- Consult the USER_MANUAL.md for user-specific issues
- Contact the development team for technical support

### Contact Information

For technical support and questions:
- **Documentation**: Check the `documentation/` directory
- **Issues**: Use the project issue tracker
- **Emergency**: Contact the system administrator

---

*This guide is maintained by the TwoSpace development team. Last updated: January 2025*
