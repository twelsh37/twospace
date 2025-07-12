# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.0] - 2024-06-10

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

## [1.0.0] - 2024-06-01

### Added

- Initial release.
