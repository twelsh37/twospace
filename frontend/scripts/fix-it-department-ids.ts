// FILEPATH: frontend/scripts/fix-it-department-ids.ts
// Migration script to ensure all users are assigned to the canonical IT department ID
// and to remove duplicate IT department records.

import { db } from "@/lib/db";
import { usersTable, departmentsTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

const IT_DEPARTMENT_NAME = "IT Department";

async function main() {
  // 1. Find all IT department records by name
  const itDepartments = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.name, IT_DEPARTMENT_NAME));

  if (itDepartments.length === 0) {
    // Create the canonical IT department if it doesn't exist
    const [created] = await db
      .insert(departmentsTable)
      .values({ name: IT_DEPARTMENT_NAME, locationId: "DEFAULT_LOCATION_ID" })
      .returning();
    itDepartments.push(created);
    console.log(`Created new IT department: ${created.id}`);
  }

  // 2. Pick the canonical department (first found)
  const canonical = itDepartments[0];
  const canonicalId = canonical.id;

  // 3. Gather all IT department IDs (including duplicates)
  const allItDeptIds = itDepartments.map((d) => d.id);

  // 4. Update all users with any IT department ID to use the canonical one
  const updatedUsers = await db
    .update(usersTable)
    .set({ departmentId: canonicalId })
    .where(inArray(usersTable.departmentId, allItDeptIds))
    .returning();

  console.log(`Updated ${updatedUsers.length} users...`);

  // 5. Optionally, delete duplicate IT department records (except canonical)
  if (allItDeptIds.length > 1) {
    const toDelete = allItDeptIds.filter((id) => id !== canonicalId);
    await db
      .delete(departmentsTable)
      .where(inArray(departmentsTable.id, toDelete));
    console.log(
      `Deleted ${
        toDelete.length
      } duplicate IT department records: ${toDelete.join(", ")}`
    );
  } else {
    console.log("No duplicate IT department records found.");
  }
}

main()
  .then(() => {
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });

/*
REASONING:
- This script ensures all users are assigned to the correct IT department ID.
- It is safe to run multiple times (idempotent).
- It cleans up duplicate department records to prevent future confusion.
- It logs all actions for transparency.
*/
