# WORKFLOW_README.md

## Asset Management Workflow

This document explains how assets are managed within the application, including their lifecycle, possible states, and how transitions between states are handled.

---

## 1. Asset Lifecycle Overview

Assets in the system represent physical or digital items tracked by the organization. Each asset moves through a series of states from creation/import to assignment and use. The workflow depends on the asset type.

### Typical Asset Lifecycle (by Asset Type):

#### For Desktops, Laptops, Tablets, and Phones (Devices that require building):

1. **Holding**: Asset is in holding area (e.g., just imported, not yet tagged).
2. **Available Stock**: Stock that is available to be signed out.
3. **Signed Out**: Asset is taken from stock for configuration/building.
4. **Building**: Asset is being configured or built.
5. **Ready to Go**: Device has completed building and is configured for deployment.
6. **Issued**: Asset is assigned to a person or location.

#### For Monitors (No build required):

1. **Holding**: Asset is in holding area (e.g., just imported, not yet tagged).
2. **Available Stock**: Stock that is available to be signed out.
3. **Signed Out**: Asset is taken from stock.
4. **Issued**: Asset is assigned to a person or location.

---

## 2. Asset States

| State           | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| Holding         | Asset is in holding area (e.g., just imported, not yet tagged). |
| Available Stock | Stock that is available to be signed out.                       |
| Signed Out      | Asset is taken from stock.                                      |
| Building        | Asset is being configured.                                      |
| Ready to Go     | Device has completed building and is ready for deployment.      |
| Issued          | Asset is assigned to a person or location.                      |

_Note: Only these states are used in the application. The workflow for each asset type determines which states are used and in what order._

---

## 3. State Transitions

### Devices (Desktops, Laptops, Tablets, Phones)

```mermaid
graph TD;
  HOLDING(("Holding")) --> AVAILABLE(("Available Stock"))
  AVAILABLE --> SIGNED_OUT(("Signed Out"))
  SIGNED_OUT --> BUILDING(("Building"))
  BUILDING --> READY_TO_GO(("Ready to Go"))
  READY_TO_GO --> ISSUED(("Issued"))
```

### Monitors

```mermaid
graph TD;
  HOLDING_MON(("Holding")) --> AVAILABLE_MON(("Available Stock"))
  AVAILABLE_MON --> SIGNED_OUT_MON(("Signed Out"))
  SIGNED_OUT_MON --> ISSUED_MON(("Issued"))
```

**Explanation:**

- **Devices**: Must be built/configured before being issued. They follow the full workflow: Holding → Available Stock → Signed Out → Building → Ready to Go → Issued.
- **Monitors**: Do not require building. They follow a shorter workflow: Holding → Available Stock → Signed Out → Issued.

---

## 4. How State Transitions Are Managed

- **Backend Logic**: State transitions are enforced in the backend API (see `/api/assets` and related routes). Only valid transitions are allowed based on asset type.
- **Frontend UI**: The UI presents actions (e.g., sign out, build, issue) based on the current state and asset type. Invalid transitions are not shown to the user.
- **Bulk Import**: Imported assets are always placed in the Holding state initially, as seen in `frontend/app/imports/page.tsx`.
- **Audit Trail**: All state changes are logged for traceability (see asset history components).

---

## 5. Example: Bulk Import Workflow

1. Admin imports assets via CSV/XLSX.
2. Imported assets appear in the Holding state ("IT Department - Store room").
3. For devices, assets move to Available Stock, are signed out, built, marked as ready, and then issued.
4. For monitors, assets move to Available Stock, are signed out, and then issued directly.

---

## 6. Holding → Available Stock Transition (Detailed)

### Overview

The transition from **Holding** to **Available Stock** is a key step in the asset workflow. This process is typically performed by an administrator after assets have been imported and reviewed.

### Steps Involved

1. **Asset in Holding**: After import, assets are stored in the `holding_assets` table with status `pending` and are visible in the "View Holding Assets" UI.
2. **Assign Asset Number**: An admin assigns an asset number and confirms the asset type (e.g., DESKTOP, LAPTOP, etc.) using the UI modal. This triggers a backend API call to `/api/holding-assets/assign`.
3. **Backend Processing**:
   - The backend validates the asset number and type.
   - The asset is moved from `holding_assets` to the main `assets` table.
   - The asset is inserted with state `AVAILABLE` and status `stock`.
   - The `location_id` is set to the IT Department - store room by default (UUID: `0d964e1a-fabd-4833-9dad-aadab0ea1e1e`).
   - An entry is added to the `asset_history` table to record the transition and the user who performed it.
   - The asset is removed from `holding_assets`.
4. **UI Update**: The asset disappears from the "Holding Assets" list and appears in the "Available Stock" list (if such a view is implemented).
5. **Permissions**: Only users with admin privileges can perform this transition.
6. **Audit Trail**: The transition is logged in the asset history for traceability, including the user, timestamp, and details of the change.

### Database Changes

- **From**: `holding_assets` (status: `pending`)
- **To**: `assets` (state: `AVAILABLE`, status: `stock`, location: IT Department - store room)
- **History**: New row in `asset_history` with `new_state: AVAILABLE` and `change_reason: Asset assigned number and moved from holding_assets`.

### Error Handling

- The backend checks for duplicate asset numbers and serial numbers before moving.
- If the asset number or serial number already exists, the transition is aborted and a user-friendly error is returned.
- If the asset is missing required fields, the transition is aborted.

### References

- `frontend/app/api/holding-assets/assign/route.ts` – Backend logic for the transition
- `frontend/components/holding-assets/EditHoldingAssetModal.tsx` – UI for assigning asset numbers
- `frontend/components/holding-assets/HoldingAssetsTable.tsx` – Table of holding assets

---

## 7. Additional Notes

- Only users with appropriate permissions (e.g., Admin) can perform certain transitions (e.g., issue assets).
- The system ensures data integrity by preventing invalid transitions.
- All state labels and logic are centralized in the codebase for consistency.
- The workflow is determined by the asset type (devices vs. monitors).

---

## 8. References

- `frontend/app/imports/page.tsx` – Bulk import logic and state assignment
- `@/lib/constants` – Asset state labels
- `@/lib/types` – AssetState enum
- Asset detail/history components – For tracking state changes
- `frontend/app/api/holding-assets/assign/route.ts` – Holding to Available Stock transition logic
- `frontend/components/holding-assets/EditHoldingAssetModal.tsx` – Assign asset number UI
- `frontend/components/holding-assets/HoldingAssetsTable.tsx` – Holding assets table

---

## Logging and Workflow Troubleshooting

All asset workflow actions, state transitions, and errors are logged server-side using a console-based logger. Logs are output to the console and are viewable in the Vercel dashboard (or your serverless provider's logs UI). There are separate logs for system and application events, labelled accordingly.

- **Admins**: Use the Vercel dashboard to audit workflow actions, investigate errors, and monitor system health.
- **Users**: If you encounter workflow issues, notify the admin, who can review logs in the Vercel dashboard for troubleshooting.
- **Why?** Vercel and other serverless platforms do not support persistent file storage. Console logging is the recommended approach for compatibility and reliability.

This logging system supports workflow troubleshooting, audit trails, and compliance.

---

<!--
Reasoning:
- This document now accurately reflects the real asset states and workflows for different asset types, including the 'Available Stock' state.
- Mermaid diagrams have been updated to show the correct transitions for devices and monitors.
- Explanatory comments and sections ensure clarity for all team members.
- The Holding → Available Stock process is now fully documented for both backend and frontend.
-->
