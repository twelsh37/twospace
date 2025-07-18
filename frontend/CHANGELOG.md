# Changelog

All notable changes to this project will be documented in this file.

## [0.0.5] - 2025-06-13

### Added

- Asset Inventory PDF export now includes all charts and table data as seen on the screen.
- Export modal provides a robust, user-friendly workflow for exporting reports as PDF.

### Fixed

- Fixed invalid React hook call in reports page by moving useState inside the component.
- Prevented infinite render loop by gathering export data only on export action, not on every render.
- Removed unused imports to resolve ESLint build errors.
- Export workflow is now robust and bug-free for Asset Inventory reports.

## [0.0.4] - 2025-06-12

### Fixed

- Fixed all build and type errors related to filter state and enum usage in assets and users pages.
- Enforced consistent use of uppercase enum values (e.g., 'HOLDING', 'ACTIVE', 'STOCK') throughout schema and seed files.
- Resolved all linter errors and removed unused variables/imports.
- Ensured filter logic uses 'all' (lowercase) for UI, but always sends correct enum values to backend.
- Project now builds and passes type checks cleanly.

## [Unreleased]

### Added

- Comprehensive error trapping and handling fortifications across all major pages and client components:
  - Wrapped all critical client components in ErrorBoundary for robust runtime error trapping.
  - /dashboard: ErrorBoundary applied to RecentActivity and all client widgets; server components use fallback UI for data errors.
  - /assets: AssetTable wrapped in ErrorBoundary for runtime error trapping.
  - /locations: LocationTable wrapped in ErrorBoundary for robust error handling.
  - /users: UserTable wrapped in ErrorBoundary to catch rendering errors.
  - /reports: Main ReportsPageContent wrapped in ErrorBoundary for comprehensive error trapping.
  - /imports: ImportsPage wrapped in ErrorBoundary for bulk import UI resilience.
  - /settings: SettingsPage wrapped in ErrorBoundary for system configuration safety.
- All user-facing error messages are now clear, actionable, and never technical.
- All data fetch and rendering errors are handled gracefully with user-friendly fallback UI.
- No technical or system errors are surfaced to end users; all errors are logged and/or displayed in a non-confusing manner.
- Updated code comments and documentation to clarify error handling strategy and reasoning.

### Added

- Comprehensive server-side logging using Winston for all API routes and utilities.
- Daily log rotation with 30-day retention using winston-daily-rotate-file.
- Separate logs for system events (`system.log_YYYYMMDD.log`) and application events (`app.log_YYYYMMDD.log`).
- Extensive explanatory comments and documentation for logging usage, audit, and troubleshooting.
- Logging is server-side only (no Winston on client).
- Migrated all server-side logging from Winston/file-based logging to console-based logging for full compatibility with Vercel and other serverless platforms.
  - All logs are now output to the console and viewable in the Vercel dashboard (or your serverless provider's logs UI).
  - Removed all references to Winston, file-based logs, and log file locations from the codebase and documentation.
  - **Reason:** Vercel and similar platforms do not support persistent file storage. Console logging is the recommended and supported approach for reliability and operational visibility.

## [Unreleased]
- Changed: Sidebar and protected route admin checks now use Supabase Auth role (`user.user_metadata.role`) instead of the app `users` table. This avoids issues with RLS and ensures consistent admin access. Update user roles in Supabase Auth to control admin privileges.

## [0.0.3] - 2025-06-11

### Added

- Default filter state for assets, users, and locations now set to 'ALL' for all dropdowns.
- Asset filters always show 'All Types', 'All States', and 'All Statuses' as default options.
- Consistent filter UX and clear filters button across assets, users, and locations pages.
- Documentation of all filter designators in `FILTERS_DESIGNATORS.md`.

### Changed

- Filter logic updated to never send 'ALL' to the backend; 'ALL' is treated as no filter.
- All filter designators and enums are now uppercase in both frontend and backend.
- Improved URL query param handling for filters to use uppercase consistently.
- Asset page now always shows all assets by default.

### Fixed

- Fixed issues where selecting 'ALL' would cause enum errors in the backend.
- Ensured clear filters resets all dropdowns to 'ALL' and shows all assets.

## [0.0.2] - 2025-06-10

### Added

- Migration script for department ID consistency (`fix-it-department-ids.ts`).
- Yarn script (`db:fix-departments`) for department migration using `tsx`.
- Exported `DepartmentOption` and `RoleOption` types for cross-component type safety.
- Extensive explanatory comments for maintainability.

### Changed

- Refactored all filter-related code to use strict types (no `any`) and robust type guards.
- Updated all filter and user management code for strict typing and ESLint compliance.
- Updated Supabase integration for department typing with explicit `Department` type.
- Removed unused `LocationOption` and replaced all `any` with `unknown` and type guards.

### Fixed

- Type errors and linter issues in filters, user management, and Supabase integration.
- Ensured all code builds and lints cleanly (`yarn build`).

## [0.0.1] - 2025-06-01

### Added

- Initial release.
