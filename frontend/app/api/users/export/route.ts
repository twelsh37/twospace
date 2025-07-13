// frontend/app/api/users/export/route.ts
// API route to export filtered users as CSV or PDF using browserless.io
// Accepts department and role filters, fetches all matching users, generates a report

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, departmentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  generateTableReportHTML,
  generateTableCSV,
  generatePDFViaBrowserless,
} from "@/lib/server/exportUtils";
import { systemLogger, appLogger } from "@/lib/logger";

// Define columns for the users export (match table columns)
const userColumns = [
  { header: "Name", key: "name" },
  { header: "Email", key: "email" },
  { header: "Role", key: "role" },
  { header: "Department", key: "department" },
  { header: "Active", key: "isActive" },
  { header: "Employee ID", key: "employeeId" },
];

export async function POST(request: NextRequest) {
  // Log the start of the POST request
  appLogger.info("POST /api/users/export called");
  try {
    // Accept 'format' in request body (default to 'pdf' for backward compatibility)
    const {
      department = "all",
      role = "all",
      format = "pdf",
    } = await request.json();
    // Log the filters and format being used
    appLogger.info("Exporting users with filters", {
      department,
      role,
      format,
    });
    // Build where conditions for filters (reuse logic from users/route.ts)
    const whereConditions = [];
    let joinDepartment = false;
    if (department !== "all") {
      joinDepartment = true;
    }
    if (role !== "all" && (role === "ADMIN" || role === "USER")) {
      whereConditions.push(eq(usersTable.role, role as "ADMIN" | "USER"));
    }
    let users;
    if (joinDepartment) {
      users = await db
        .select({
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          department: departmentsTable.name,
          isActive: usersTable.isActive,
          employeeId: usersTable.employeeId,
        })
        .from(usersTable)
        .innerJoin(
          departmentsTable,
          eq(usersTable.departmentId, departmentsTable.id)
        )
        .where(and(eq(departmentsTable.name, department), ...whereConditions));
    } else {
      if (whereConditions.length > 0) {
        users = await db
          .select({
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role,
            department: departmentsTable.name,
            isActive: usersTable.isActive,
            employeeId: usersTable.employeeId,
          })
          .from(usersTable)
          .innerJoin(
            departmentsTable,
            eq(usersTable.departmentId, departmentsTable.id)
          )
          .where(and(...whereConditions));
      } else {
        users = await db
          .select({
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role,
            department: departmentsTable.name,
            isActive: usersTable.isActive,
            employeeId: usersTable.employeeId,
          })
          .from(usersTable)
          .innerJoin(
            departmentsTable,
            eq(usersTable.departmentId, departmentsTable.id)
          );
      }
    }
    // Map isActive to Yes/No for export
    const exportRows = users.map((u) => ({
      ...u,
      isActive: u.isActive ? "Yes" : "No",
    }));
    const filters = { department, role };
    if (format === "csv") {
      // Log CSV export
      appLogger.info(
        `Generating CSV export for users (${exportRows.length} rows)`
      );
      // Generate CSV string
      const csv = generateTableCSV({ columns: userColumns, rows: exportRows });
      // Return as downloadable CSV file
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=users-report.csv`,
        },
      });
    } else {
      // Log PDF export
      appLogger.info(
        `Generating PDF export for users (${exportRows.length} rows)`
      );
      // Generate HTML
      const html = generateTableReportHTML({
        title: "User Report",
        columns: userColumns,
        rows: exportRows,
        filters,
      });
      // Generate PDF via browserless.io
      const pdfBuffer = await generatePDFViaBrowserless(html);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=users-report.pdf`,
        },
      });
    }
  } catch (error) {
    systemLogger.error(
      `User export error: ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to generate user export" },
      { status: 500 }
    );
  }
}
