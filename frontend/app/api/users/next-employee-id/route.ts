// frontend/app/api/users/next-employee-id/route.ts
// API route for generating next employee ID

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { systemLogger, appLogger } from "@/lib/logger";

export async function GET() {
  // Log the start of the GET request
  appLogger.info("GET /api/users/next-employee-id called");
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
    appLogger.info("Next employeeId generated", { nextEmployeeId: nextId });
    return NextResponse.json({ nextEmployeeId: nextId });
  } catch (error) {
    systemLogger.error(
      `Error getting next employeeId: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to get next employeeId." },
      { status: 500 }
    );
  }
}
