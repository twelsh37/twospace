# Asset Management System - Master Plan

## Overview and Objectives

The Asset Management System is a comprehensive web-based solution designed to manage company assets throughout their complete lifecycle. The system provides a user-friendly, mobile-first interface that enables organizations to efficiently track, manage, and maintain their technology assets from procurement through disposal.

### Primary Objectives

- Streamline asset lifecycle management from creation to disposal
- Provide real-time visibility into asset availability and location
- Enable bulk import capabilities for efficient asset onboarding
- Maintain comprehensive audit trails for compliance and accountability
- Support both individual and shared asset assignments
- Deliver actionable insights through dashboard reporting

## Target Audience

### Primary Users

- **IT Administrators**: Full system access for asset management, user administration, and system configuration
- **IT Staff**: Asset building, configuration, and assignment responsibilities
- **Department Managers**: Asset allocation and location management

### Secondary Users

- **End Users**: Asset assignment and basic asset information access
- **Finance Teams**: Asset valuation and cost tracking
- **Compliance Teams**: Audit trail and reporting access

## Core Features and Functionality

### 1. Asset Lifecycle Management

**Asset States:**

- **Available Stock**: New assets ready for processing
- **Signed Out**: Assets removed from available stock for building/configuration
- **Built**: Assets configured and prepared (phones, tablets, desktops, laptops only)
- **Ready To Go Stock (RTGS)**: Assets ready for assignment
- **Issued**: Assets assigned to individuals or locations

**Lifecycle Flow:**

- **Mobile Phones, Tablets, Desktops, Laptops**: Available → Signed Out → Built → RTGS → Issued
- **Monitors**: Available → Signed Out → RTGS → Issued

### 2. Asset Properties

- **Asset Number**: Auto-generated with format `XX-YYYYY` (prefix + 5-digit sequence)
  - 01: Mobile Phone
  - 02: Tablet
  - 03: Desktop
  - 04: Laptop
  - 05: Monitor
- **Creation Date/Time**: Automatic timestamp
- **Update Date/Time**: Automatic timestamp on modifications
- **Deletion Date/Time**: Soft delete tracking
- **Purchase Price**: Required field with validation
- **Serial Number**: Required unique identifier
- **Description**: Asset details (e.g., "Philips 242H1/00 Monitor")
- **Location**: Current asset location
- **Assignment Type**: Individual person or shared location (checkbox)
- **Assigned To**: Person name, employee ID, department (for individual assignments)

### 3. Bulk Import System

- **File Support**: CSV and Excel file imports
- **Column Mapping**: Flexible mapping interface for supplier data to database fields
- **Validation**: Data validation during import process
- **Asset Number Generation**: Automatic sequential numbering for imported assets
- **File Upload**: Users upload CSV/XLSX files directly; Vercel Blob Storage is not used for import data.

### 4. User Management

- **Role-Based Access Control**:
  - **Admin**: Full CRUD operations, user management, system configuration
  - **User**: All operations except record deletion
- **User Import**: CSV/Excel import for bulk user onboarding
- **User Properties**: Name, employee ID, department, role
- **Authentication & Authorization**: Uses Supabase Auth for authentication and role-based authorization (ADMIN/USER). All users must log in via Supabase Auth. Role-based access is enforced in both the UI and API endpoints.

### 5. Location Management

- **Initial Locations**: 10 predefined locations with placeholder names
- **Location Import**: CSV/Excel import for additional locations
- **Location Assignment**: Support for both individual and shared device assignments

### 6. Audit Trail System

- **State Change Tracking**: Complete history of asset state transitions
- **User Tracking**: Record of who made each change
- **Timestamp Recording**: Precise date/time of all modifications
- **Change Details**: Comprehensive logging of all asset modifications
- **Audit Trail View**: There will be a user-accessible audit trail area, showing who transitioned assets, with time/date and color-coded badges matching the app's color scheme.

### 7. Dashboard and Reporting

- **Inventory Overview**: Real-time counts of available assets by type
- **Asset Status**: Current state distribution across all assets
- **Location Summary**: Asset distribution by location
- **Quick Actions**: Direct access to common operations
- **Advanced Reporting & Analytics**: Planned for future implementation, including predictive analytics (e.g., hardware burndown rate) to help with stock management.

### PDF Export and Reporting

- **PDF Generation**: All PDF exports (such as Asset Inventory Reports) are generated using [browserless.io](https://www.browserless.io/), a cloud-based headless Chrome service. This ensures compatibility with Vercel and serverless environments. Puppeteer is no longer used directly in the codebase.

## High-Level Technical Stack

### Frontend & API

- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Shadcn/ui component library
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with Zod validation
- **API**: Next.js API routes (no separate backend service; all business logic and database access is handled in the Next.js frontend via API routes and server components)
- **Database**: Neon Postgres
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth for authentication/authorization
- **File Upload**: Users upload CSV/XLSX files directly for import; Vercel Blob Storage is not used
- **Hosting**: Vercel platform
- **Package Manager**: Yarn
- **Version Control**: Git
- **Environment**: TypeScript throughout
- **PDF Export**: [browserless.io](https://www.browserless.io/) REST API for cloud-based PDF generation (replaces Puppeteer)

> **Note:** There is no separate backend service. All business logic, API endpoints, and database access are implemented in the Next.js frontend using API routes and server components. The project does not use Prisma or a traditional backend server. Supabase is used for authentication and user management.

## Conceptual Data Model

### Core Entities

1. **Assets**: Main asset records with all properties
2. **Users**: System users with roles and permissions
3. **Locations**: Physical locations within the organization
4. **AssetStates**: Lifecycle state definitions
5. **AssetHistory**: Audit trail records
6. **AssetAssignments**: Current asset assignments

### Key Relationships

- Assets belong to Locations
- Assets are assigned to Users (optional)
- Assets have multiple History records
- Users have Roles and Permissions
- Assets transition through States

## User Interface Design Principles

### Mobile-First Approach

- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Simplified navigation for mobile users
- Progressive enhancement for desktop

### User Experience

- Intuitive asset lifecycle visualization
- Clear state indicators and transitions
- Streamlined bulk operations
- Real-time feedback and validation
- Consistent design language with Shadcn/ui

### Key Interface Components

- **Dashboard**: Overview with quick actions
- **Asset Management**: CRUD operations with lifecycle controls
- **Import Interface**: File upload and column mapping
- **Reporting**: Asset statistics and status views
- **User Management**: Role-based access control
- **Audit Trail**: User-accessible view of asset transitions and changes

## Security Considerations

### Authentication and Authorization

- Secure user authentication using Supabase Auth
- Role-based access control (ADMIN/USER)
- Session management via Supabase
- API route protection with server-side Supabase session and role checks

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Audit and Compliance

- Comprehensive audit trails
- Data retention policies
- Secure logging
- Backup and recovery procedures

## Development Phases

### Phase 1: Foundation (Weeks 1-2)

- Project setup with Next.js, TypeScript, and Shadcn/ui
- Database schema design and implementation
- Basic authentication system (planned; will use Clerk)
- Core asset CRUD operations

### Phase 2: Asset Lifecycle (Weeks 3-4)

- Asset state management system
- Lifecycle workflow implementation
- Audit trail functionality
- Basic dashboard

### Phase 3: Import System (Weeks 5-6)

- CSV/Excel import functionality
- Column mapping interface
- Bulk asset creation
- Data validation

### Phase 4: User Management (Weeks 7-8)

- Role-based access control
- User import functionality
- Permission system
- User assignment features

### Phase 5: Reporting and Polish (Weeks 9-10)

- Advanced dashboard features
- Reporting capabilities (planned)
- UI/UX refinements
- Testing and bug fixes

### Phase 6: Deployment and Documentation (Weeks 11-12)

- Vercel deployment
- Production environment setup
- Documentation
- User training materials (to be created once the product is feature-complete)

## Potential Challenges and Solutions

### Technical Challenges

1. **Complex State Management**: Implement robust state machine for asset lifecycle
2. **Bulk Import Performance**: Use streaming and batch processing for large files
3. **Real-time Updates**: Implement efficient data synchronization
4. **Mobile Responsiveness**: Ensure optimal experience across all devices

### Business Challenges

1. **Data Migration**: Provide tools for importing existing asset data
2. **User Adoption**: Create intuitive interface and comprehensive training
3. **Scalability**: Design for growth in asset and user numbers
4. **Compliance**: Ensure audit trails meet organizational requirements

### Solutions

- Comprehensive testing strategy (Jest will be used for unit and feature testing)
- Performance monitoring and optimization
- User feedback integration
- Iterative development approach

## Future Expansion Possibilities

### Advanced Features

- **Barcode/QR Code Integration**: Physical asset tagging and scanning (planned; will be added soon)
- **Maintenance Scheduling**: Preventive maintenance tracking (possible future enhancement)
- **Depreciation Tracking**: Not planned
- **Integration APIs**: Connect with procurement and HR systems (possible future enhancement)
- **Mobile App**: Native mobile application (planned for the future; currently mobile-first web)
- **Advanced Analytics**: Predictive analytics and reporting (planned)
- **Workflow Automation**: Automated approval processes (possible future enhancement)
- **Multi-tenant Support**: Not planned

### Integration Opportunities

- **Procurement Systems**: Automated asset creation from purchase orders
- **HR Systems**: Automatic user assignment from employee data
- **Accounting Systems**: Asset valuation and depreciation tracking (not planned)
- **IT Service Management**: Integration with help desk systems

## Success Metrics

### Technical Metrics

- System uptime and performance
- User adoption rates
- Data accuracy and integrity
- Response times for key operations

### Business Metrics

- Asset utilization rates
- Process efficiency improvements
- Cost savings from better asset management
- Compliance audit results

---

This masterplan provides a comprehensive blueprint for developing a robust, scalable, and user-friendly Asset Management System that meets the specific needs of modern organizations while maintaining flexibility for future growth and enhancement.
