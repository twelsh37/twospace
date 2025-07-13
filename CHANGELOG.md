# Changelog

All notable changes to this project will be documented in this file.

## [0.0.4] - 2025-06-12

### Fixed

- Fixed all build and type errors related to filter state and enum usage in assets and users pages.
- Enforced consistent use of uppercase enum values (e.g., 'HOLDING', 'ACTIVE', 'STOCK') throughout schema and seed files.
- Resolved all linter errors and removed unused variables/imports.
- Ensured filter logic uses 'all' (lowercase) for UI, but always sends correct enum values to backend.
- Project now builds and passes type checks cleanly.

## [Unreleased]

### Added

- Comprehensive server-side logging using Winston for all API routes and utilities.
- Daily log rotation with 30-day retention using winston-daily-rotate-file.
- Separate logs for system events (`system.log_YYYYMMDD.log`) and application events (`app.log_YYYYMMDD.log`).
- Extensive explanatory comments and documentation for logging usage, audit, and troubleshooting.
- Logging is server-side only (no Winston on client).

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
