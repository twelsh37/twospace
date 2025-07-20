// frontend/app/api/users/export/route.ts
// API route to export filtered users as CSV or PDF using browserless.io
// Accepts department and role filters, fetches all matching users, generates a report

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, departmentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  generateTableReportHTML,
  generatePDFViaBrowserless,
  generateTableCSVStream, // <-- import streaming CSV
} from "@/lib/server/exportUtils";
import { systemLogger, appLogger } from "@/lib/logger";
import { Readable } from "stream";

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
    if (department !== "all") {
      whereConditions.push(eq(departmentsTable.id, department));
    }
    if (role !== "all" && (role === "ADMIN" || role === "USER")) {
      whereConditions.push(eq(usersTable.role, role as "ADMIN" | "USER"));
    }
    // Normalize department to lowercase for comparison
    const departmentFilter = String(department).toLowerCase();
    let users;
    if (departmentFilter !== "all") {
      // Filter by departmentId if department is not 'all'
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
        .where(and(eq(departmentsTable.id, department), ...whereConditions));
    } else {
      // Do not filter by department at all
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
    // Map isActive to Yes/No for export, and ensure all fields are flat strings/primitives
    const exportRows = users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department, // always a string
      isActive: u.isActive ? "Yes" : "No",
      employeeId: u.employeeId,
    }));
    // Debug logging
    console.log("Exporting users:", exportRows);
    console.log("User columns:", userColumns);
    const filters = { department, role };
    if (format === "csv") {
      // Log CSV export
      appLogger.info(
        `Generating CSV export for users (${exportRows.length} rows)`
      );
      // Stream CSV using fast-csv for large datasets
      const csvStream = generateTableCSVStream({
        columns: userColumns,
        rows: exportRows,
      });
      // Convert Node.js stream to web ReadableStream for Next.js
      const webStream = Readable.toWeb(csvStream);
      // Return as downloadable CSV file (streamed)
      return new NextResponse(
        webStream as unknown as ReadableStream<Uint8Array>,
        {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=users-report.csv`,
          },
        }
      );
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") || "all";
    const role = searchParams.get("role") || "all";
    // Build where conditions for filters
    const whereConditions = [];
    if (role !== "all" && (role === "ADMIN" || role === "USER")) {
      whereConditions.push(eq(usersTable.role, role as "ADMIN" | "USER"));
    }
    const departmentFilter = String(department).toLowerCase();
    let users;
    if (departmentFilter !== "all") {
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
        .where(and(eq(departmentsTable.id, department), ...whereConditions));
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
    const exportRows = users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      isActive: u.isActive ? "Yes" : "No",
      employeeId: u.employeeId,
    }));
    // Stream CSV using fast-csv
    const csvStream = generateTableCSVStream({
      columns: userColumns,
      rows: exportRows,
    });
    const webStream = Readable.toWeb(csvStream);
    return new NextResponse(
      webStream as unknown as ReadableStream<Uint8Array>,
      {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=users-report.csv`,
        },
      }
    );
  } catch (error) {
    systemLogger.error(
      `User export error (GET): ${
        error instanceof Error ? error.stack : String(error)
      }`
    );
    return NextResponse.json(
      { error: "Failed to generate user export" },
      { status: 500 }
    );
  }
}
