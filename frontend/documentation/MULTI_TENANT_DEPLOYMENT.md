# Multi-Tenant Asset Management System - Deployment Guide

## Overview

This guide covers the deployment strategy for transitioning from a standalone asset management application to a fully configurable, multi-tenant system. The system supports both single-tenant deployments and multi-tenant white-labeling.

## Deployment Phases

### Phase 1: Standalone Application (Current)

- Single database instance
- Hardcoded asset types and states
- Fixed asset numbering system
- Single company configuration

### Phase 2: Configurable Single Tenant

- User-configurable asset label templates
- Customizable asset types and states
- Configurable state transitions
- Company branding and colors

### Phase 3: Multi-Tenant System

- Multiple tenant databases or schemas
- White-labeling capabilities
- Tenant-specific configurations
- Scalable architecture

## Current Architecture

The system currently uses:

- **Next.js 14** with App Router
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **Supabase** for authentication and hosting
- **Shadcn/ui** components with Tailwind CSS

## New Configuration System

### 1. Asset Label Templates

**Current**: Fixed format (XX-YYYYY)
**New**: Configurable template system

```typescript
// Example: AIAA-01-1000
{
  companyPrefix: "AIAA",
  assetTypeCode: "01",
  assetNumber: "1000",
  separator: "-",
  format: "{prefix}-{type}-{number}"
}
```

**Benefits**:

- Company-specific prefixes
- Flexible numbering schemes
- Support for different separators
- Easy to modify without code changes

### 2. State Transition Management

**Current**: Hardcoded state transitions in constants
**New**: Database-driven state management

```typescript
// Configurable states with custom names and colors
{
  stateCode: "IN_TRANSIT",
  stateName: "In Transit",
  stateColor: "#F59E0B",
  stateOrder: 2,
  isStartState: false,
  isEndState: false
}
```

**Benefits**:

- Custom state names (e.g., "In Transit" vs "Signed Out")
- Customizable colors and ordering
- Flexible workflow definitions
- Support for different business processes

### 3. Asset Type Customization

**Current**: 5 fixed asset types
**New**: Unlimited custom asset types

```typescript
{
  typeCode: "06",
  typeName: "Network Switch",
  category: "Networking",
  iconName: "switch"
}
```

**Benefits**:

- Industry-specific asset types
- Custom categories and icons
- Scalable type system
- Better organization

## Database Schema Changes

### New Tables Added

1. **`tenant_configs`** - Company information and branding
2. **`asset_label_templates`** - Asset numbering templates
3. **`custom_asset_types`** - User-defined asset types
4. **`custom_asset_states`** - User-defined asset states
5. **`state_transition_rules`** - State transition logic
6. **`business_rules`** - Configurable business logic

### Migration Strategy

1. **Backup existing database**
2. **Run migration script**: `yarn tsx scripts/setup-configuration-tables.ts`
3. **Verify data integrity**
4. **Update application code to use new configuration system**

## Configuration Management Interface

### Admin Panel Features

1. **General Configuration**

   - Company name and prefix
   - Brand colors
   - Logo upload

2. **Asset Label Templates**

   - Template format configuration
   - Preview functionality
   - Validation rules

3. **Asset Types Management**

   - Add/remove asset types
   - Category organization
   - Icon selection

4. **State Management**
   - Custom state names
   - Color customization
   - Workflow ordering
   - Start/end state designation

## Deployment Steps

### Step 1: Prepare Database

```bash
# Backup existing database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration script
yarn tsx scripts/setup-configuration-tables.ts
```

### Step 2: Deploy Application

```bash
# Build and deploy
yarn build
vercel --prod
```

### Step 3: Configure Initial Settings

1. Access admin configuration panel
2. Set company information
3. Configure asset label template
4. Customize asset types and states
5. Test asset creation with new configuration

### Step 4: Validate System

1. Create test assets with new numbering
2. Verify state transitions work correctly
3. Check that customizations are applied
4. Test user permissions and access

## Multi-Tenant Transition

### Option 1: Database-per-Tenant

```typescript
// Each tenant gets their own database
const tenantDb = new Pool({
  connectionString: `postgresql://user:pass@host/${tenantId}_db`,
});
```

**Pros**:

- Complete data isolation
- Independent scaling
- Easy backup/restore per tenant

**Cons**:

- Higher resource usage
- More complex deployment
- Harder to manage

### Option 2: Schema-per-Tenant

```typescript
// Each tenant gets their own schema
await db.query(`SET search_path TO ${tenantId}_schema`);
```

**Pros**:

- Single database instance
- Easier management
- Shared resources

**Cons**:

- Potential for data leakage
- More complex queries
- Harder to backup individual tenants

### Option 3: Row-Level Security

```typescript
// Use PostgreSQL RLS for tenant isolation
CREATE POLICY tenant_isolation ON assets
  FOR ALL USING (tenant_id = current_setting('app.tenant_id'));
```

**Pros**:

- Single database
- Built-in security
- Efficient queries

**Cons**:

- More complex setup
- Potential performance impact
- Requires careful RLS configuration

## Recommended Approach

### For Initial Deployment

1. **Start with Option 2 (Schema-per-Tenant)**

   - Easier to implement
   - Good balance of isolation and efficiency
   - Simpler backup strategy

2. **Implement tenant switching**

   - URL-based tenant identification
   - Middleware for tenant context
   - Configuration caching

3. **Add white-labeling features**
   - Custom CSS variables
   - Tenant-specific branding
   - Configurable UI elements

### For Production Scaling

1. **Monitor performance**

   - Query execution times
   - Database connection usage
   - Memory and CPU utilization

2. **Consider migration to Option 1**
   - If performance becomes an issue
   - For high-value enterprise tenants
   - When regulatory requirements demand it

## Security Considerations

### Tenant Isolation

1. **Database level**

   - Separate schemas or databases
   - Row-level security policies
   - Connection pooling per tenant

2. **Application level**

   - Tenant context validation
   - Input sanitization
   - Access control checks

3. **API level**
   - Tenant ID in all requests
   - Request validation
   - Rate limiting per tenant

### Data Protection

1. **Encryption**

   - Data at rest
   - Data in transit
   - Backup encryption

2. **Access Control**
   - Role-based permissions
   - Tenant-specific roles
   - Audit logging

## Monitoring and Maintenance

### Key Metrics

1. **Performance**

   - Response times
   - Database query performance
   - Resource utilization

2. **Business**

   - Asset count per tenant
   - User activity
   - Configuration changes

3. **Technical**
   - Error rates
   - Database connections
   - Memory usage

### Maintenance Tasks

1. **Regular backups**

   - Daily automated backups
   - Test restore procedures
   - Monitor backup sizes

2. **Performance optimization**

   - Database index maintenance
   - Query optimization
   - Connection pool tuning

3. **Security updates**
   - Regular security patches
   - Dependency updates
   - Security audits

## Troubleshooting

### Common Issues

1. **Configuration not loading**

   - Check database connection
   - Verify tenant ID
   - Check configuration table data

2. **Asset numbers not generating**

   - Verify template format
   - Check company prefix
   - Validate template syntax

3. **State transitions failing**
   - Check transition rules
   - Verify state definitions
   - Check asset type associations

### Debug Commands

```bash
# Check configuration tables
psql $DATABASE_URL -c "SELECT * FROM tenant_configs;"

# Verify asset label template
psql $DATABASE_URL -c "SELECT * FROM asset_label_templates;"

# Check custom asset types
psql $DATABASE_URL -c "SELECT * FROM custom_asset_types;"
```

## Future Enhancements

### Planned Features

1. **Advanced Workflows**

   - Approval processes
   - Conditional transitions
   - Automated actions

2. **Integration Capabilities**

   - API endpoints for configuration
   - Webhook support
   - Third-party integrations

3. **Analytics and Reporting**
   - Tenant-specific dashboards
   - Custom report builders
   - Data export capabilities

### Scalability Improvements

1. **Caching Layer**

   - Redis for configuration caching
   - CDN for static assets
   - Database query caching

2. **Microservices Architecture**

   - Configuration service
   - Asset management service
   - User management service

3. **Global Distribution**
   - Multi-region deployment
   - Edge caching
   - Geographic routing

## Conclusion

The multi-tenant configuration system provides a solid foundation for scaling the asset management application. By starting with a configurable single-tenant system and gradually adding multi-tenant capabilities, you can ensure a smooth transition while maintaining system stability and performance.

The key to success is:

1. **Start simple** - Get the configuration system working for one tenant
2. **Test thoroughly** - Validate all functionality before scaling
3. **Monitor performance** - Watch for bottlenecks and optimize
4. **Plan for growth** - Design with multi-tenancy in mind from the start

This approach allows you to deliver value quickly while building a robust foundation for future growth.
