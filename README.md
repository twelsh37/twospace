# TwoSpace - Asset Management System

<!--
Filepath: frontend/documentation/README.md
This is the main README for the TwoSpace Asset Management System project.
It provides an overview of the application, its features, and how to recreate it.
-->

## Overview

TwoSpace is a comprehensive web-based Asset Management System designed to streamline the tracking, management, and lifecycle of IT assets within organizations. Built with modern web technologies and AI-assisted development, it provides a user-friendly interface for managing assets from procurement through disposal.

### Key Features

- **Comprehensive Asset Lifecycle Management**: Track assets through multiple states (Available, Signed Out, Built, Ready to Go, Issued)
- **Multi-Asset Type Support**: Mobile phones, tablets, desktops, laptops, and monitors
- **Barcode Scanning**: USB scanner and camera-based scanning for efficient data entry
- **User Management**: Role-based access control with Supabase authentication
- **Location Management**: Physical and logical asset location tracking
- **Real-time Dashboard**: Live insights and key metrics
- **Reporting & Export**: PDF export capabilities for asset inventory reports
- **Bulk Import/Export**: CSV and Excel file support for efficient data management
- **Audit Trail**: Comprehensive history tracking for compliance

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Shadcn/ui components with Tailwind CSS
- **State Management**: React hooks and context
- **Icons**: Lucide React

### Backend
- **API**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (serverless)

### Development Tools
- **Package Manager**: Yarn
- **Type Safety**: TypeScript with strict typing
- **Code Quality**: ESLint
- **Testing**: Jest

## Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twospace/frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NODE_ENV=development
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migration from `supabase-migration.sql`
   - Configure authentication settings

5. **Start the development server**
   ```bash
   yarn dev
   ```

6. **Access the application**
   Navigate to `http://localhost:3000` and log in with your Supabase credentials.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── assets/            # Asset management pages
│   ├── dashboard/         # Dashboard page
│   ├── locations/         # Location management
│   ├── users/             # User management
│   └── reports/           # Reporting pages
├── components/            # React components
│   ├── assets/           # Asset-related components
│   ├── ui/               # Shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── db/              # Database utilities
│   └── auth-context.tsx  # Authentication context
├── drizzle/              # Database migrations
└── documentation/        # Project documentation
```

## Asset Lifecycle

### Device Workflow (Phones, Laptops, Desktops, Tablets)
1. **Holding** → **Available Stock** → **Signed Out** → **Building** → **Ready to Go** → **Issued**

### Monitor Workflow
1. **Holding** → **Available Stock** → **Signed Out** → **Issued**

## User Roles

- **Admin**: Full system access for asset management, user administration, and system configuration
- **User**: Can view assets and locations, but cannot add or modify information

## Key Features in Detail

### Asset Management
- Auto-generated asset numbers with type prefixes (01: Mobile Phone, 02: Tablet, etc.)
- Comprehensive asset properties (serial number, purchase price, description, location)
- Support for individual and shared asset assignments
- Bulk operations for efficient management

### Barcode Scanning
- USB barcode scanner support (plug-and-play)
- Camera-based scanning using QuaggaJS
- Support for multiple barcode formats (Code 128, Code 39, EAN-13, etc.)

### Reporting
- Real-time dashboard with asset statistics
- PDF export capabilities using browserless.io
- Asset inventory reports with charts and table data

### Data Import/Export
- CSV and Excel file support
- Bulk asset and user import
- Flexible column mapping for supplier data

## Development

### Available Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn test` - Run tests
- `yarn lint` - Run ESLint

### Database Management
- `yarn db:generate` - Generate new migration
- `yarn db:migrate` - Apply migrations
- `yarn db:seed` - Seed database with sample data

## Deployment

The application is designed for deployment on Vercel with Supabase as the backend. The serverless architecture ensures scalability and reliability.

## Contributing

1. Follow the existing code style and TypeScript conventions
2. Add tests for new features
3. Update documentation as needed
4. Ensure all linting checks pass

## Support

For technical support or questions about the application, refer to the documentation in the `documentation/` directory:
- `ADMIN_GUIDE.md` - Technical setup and administration
- `USER_MANUAL.md` - End-user instructions
- `CHANGELOG.md` - Recent changes and updates

## License

This project is distributed under the MIT Licence. All rights reserved.
