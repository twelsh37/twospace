// frontend/app/api/users/next-employee-id/route.ts
// Returns the next available employeeId in the format EMP000001, EMP000002, etc.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Find the highest employeeId that matches EMP\d{5}
    const result = await db
      .select({ employeeId: usersTable.employeeId })
      .from(usersTable)
      .where(sql`employee_id ~ '^EMP\\d{5}$'`)
      .orderBy(sql`employee_id DESC`)
      .limit(1);
    let nextId = "EMP00001";
    if (result.length > 0 && result[0].employeeId) {
      const lastId = result[0].employeeId;
      const num = parseInt(lastId.replace("EMP", ""), 10);
      nextId = `EMP${String(num + 1).padStart(5, "0")}`;
    }
    return NextResponse.json({ nextEmployeeId: nextId });
  } catch (error) {
    console.error("Error getting next employeeId:", error);
    return NextResponse.json(
      { error: "Failed to get next employeeId." },
      { status: 500 }
    );
  }
}
