# FILTERS_DESIGNATORS.md

// Filepath: FILTERS_DESIGNATORS.md
// This file documents the official filter designators (possible values) for Assets, Locations, and Users.
// Use this as the single source of truth for filter values and terminology across the app.
//
// - Update this file whenever filter values change in the database or codebase.
// - Reference this file in code reviews and documentation to ensure consistency.
// - Dynamic values (departments, locations) are stored in the database and should be queried as needed.
//
// Reasoning: Created as part of snagging to ensure consistent terminology and reduce data errors.

---

## 1. Assets

| Filter | Designator/Value                                              | Description                                                      |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Type   | MOBILE_PHONE, TABLET, DESKTOP, LAPTOP, MONITOR                | The kind of asset (device category)                              |
| State  | AVAILABLE, SIGNED_OUT, BUILDING, READY_TO_GO, ISSUED, holding | The lifecycle state of the asset                                 |
| Status | HOLDING, ACTIVE, RECYCLED, STOCK, REPAIR                      | The inventory/status of the asset (REPAIR = in repair condition) |

---

## 2. Locations

| Filter   | Designator/Value                | Description                                     |
| -------- | ------------------------------- | ----------------------------------------------- |
| Location | (dynamic, from locations table) | The physical or logical location name           |
| Status   | active, inactive                | Whether the location is active (is_active flag) |

---

## 3. Users

| Filter     | Designator/Value                  | Description                        |
| ---------- | --------------------------------- | ---------------------------------- |
| Department | (dynamic, from departments table) | The department the user belongs to |
| Role       | ADMIN, USER                       | The user’s role in the system      |

---

// End of FILTERS_DESIGNATORS.md
// Update as needed to reflect any changes in filter logic or database schema.
