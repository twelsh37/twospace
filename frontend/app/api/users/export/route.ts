// frontend/app/api/users/export/route.ts
// API route to export filtered users as a PDF using browserless.io
// Accepts department and role filters, fetches all matching users, generates a PDF report

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, departmentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Helper: Generate HTML for the user report
interface UserReportFilters {
  department: string;
  role: string;
}
interface UserRow {
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  employeeId: string;
}
function generateUserReportHTML(users: UserRow[], filters: UserReportFilters) {
  // Pagination: 10 rows on first page, 12 on subsequent pages (including header)
  const FIRST_PAGE_ROWS = 10;
  const OTHER_PAGE_ROWS = 12;
  const pages: string[] = [];
  let i = 0;
  let pageNum = 1;

  // Calculate totalPages before rendering
  let remaining = users.length;
  let totalPages = 0;
  if (remaining > 0) {
    totalPages = 1; // first page
    remaining -= FIRST_PAGE_ROWS;
    if (remaining > 0) {
      totalPages += Math.ceil(remaining / OTHER_PAGE_ROWS);
    }
  }

  // First page
  pages.push(
    renderTablePage(users.slice(i, i + FIRST_PAGE_ROWS), pageNum, totalPages)
  );
  i += FIRST_PAGE_ROWS;
  pageNum++;
  // Subsequent pages
  while (i < users.length) {
    pages.push(
      renderTablePage(users.slice(i, i + OTHER_PAGE_ROWS), pageNum, totalPages)
    );
    i += OTHER_PAGE_ROWS;
    pageNum++;
  }

  // Helper to render a table page
  function renderTablePage(
    pageRows: UserRow[],
    pageNum: number,
    totalPages: number
  ) {
    return `
      <div class="report-page">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Active</th>
              <th>Employee ID</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows
              .map(
                (u: UserRow, idx: number) => `<tr class="${
                  idx % 2 === 0 ? "even" : "odd"
                }">
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td>${u.role}</td>
                  <td>${u.department}</td>
                  <td>${u.isActive ? "Yes" : "No"}</td>
                  <td>${u.employeeId}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <div class="table-footer">Page ${pageNum} of ${totalPages}</div>
      </div>
    `;
  }

  // Modern CSS for print and digital
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>User Report</title>
        <style>
          @page {
            size: A4;
            margin: 24mm 12mm 24mm 12mm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f6f8fa;
          }
          .container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          .accent-bar {
            height: 8px;
            width: 100%;
            background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
            border-radius: 8px 8px 0 0;
            margin-bottom: 0.5rem;
          }
          .title {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 0.2rem;
            margin-top: 0;
            color: #1d4ed8;
            letter-spacing: -1px;
          }
          .meta {
            font-size: 1.05rem;
            color: #555;
            margin-bottom: 1.5rem;
          }
          .report-page {
            page-break-after: always;
            position: relative;
            min-height: 950px;
            margin-bottom: 0;
          }
          .report-page:last-child {
            page-break-after: auto;
          }
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 1rem;
            margin-bottom: 40px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(30,64,175,0.07);
            overflow: hidden;
          }
          th, td {
            padding: 0.6rem 0.5rem;
            text-align: left;
          }
          th {
            background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
            color: #fff;
            font-weight: 700;
            font-size: 1.05rem;
            border: none;
          }
          tr.even td {
            background: #f3f6fb;
          }
          tr.odd td {
            background: #fff;
          }
          td {
            border: none;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:last-child td {
            border-bottom: none;
          }
          thead { display: table-header-group; }
          .table-footer {
            text-align: right;
            font-size: 0.97rem;
            color: #60a5fa;
            margin-top: 0.5rem;
            padding: 0 10px 0 0;
            font-weight: 500;
            letter-spacing: 0.5px;
            background: #fff;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="accent-bar"></div>
          <div class="title">User Report</div>
          <div class="meta">
            Department: <b>${filters.department || "All"}</b> | Role: <b>${
    filters.role || "All"
  }</b><br/>
            Generated: ${new Date().toLocaleString("en-GB")}
          </div>
          ${pages.join("")}
        </div>
      </body>
    </html>
  `;
}

// Helper: Generate CSV for the user report
function generateUserCSV(users: UserRow[]) {
  // CSV header
  const header = [
    "Name",
    "Email",
    "Role",
    "Department",
    "Active",
    "Employee ID",
  ];
  // Map user rows to CSV lines
  const rows = users.map((u) => [
    u.name,
    u.email,
    u.role,
    u.department,
    u.isActive ? "Yes" : "No",
    u.employeeId,
  ]);
  // Escape CSV values (handle commas, quotes, newlines)
  function escapeCSV(val: string) {
    if (val == null) return "";
    if (typeof val !== "string") val = String(val);
    if (val.includes('"')) val = val.replace(/"/g, '""');
    if (val.search(/[",\n]/) >= 0) return `"${val}"`;
    return val;
  }
  // Join header and rows
  return [
    header.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");
}

export async function POST(request: NextRequest) {
  try {
    // Accept 'format' in request body (default to 'pdf' for backward compatibility)
    const {
      department = "all",
      role = "all",
      format = "pdf",
    } = await request.json();
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
    // Generate HTML (for PDF) or CSV
    if (format === "csv") {
      // Generate CSV string
      const csv = generateUserCSV(users);
      // Return as downloadable CSV file
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=users-report.csv`,
        },
      });
    } else {
      // Generate HTML
      const html = generateUserReportHTML(users, { department, role });
      // Send to browserless.io for PDF rendering
      const browserlessToken = process.env.token;
      if (!browserlessToken) {
        return NextResponse.json(
          { error: "Missing browserless.io token in environment" },
          { status: 500 }
        );
      }
      const pdfRes = await fetch(
        `https://production-sfo.browserless.io/pdf?token=${browserlessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html }),
        }
      );
      if (!pdfRes.ok) {
        const errText = await pdfRes.text();
        console.error("Browserless PDF error:", errText);
        return NextResponse.json(
          { error: "Failed to generate PDF via browserless.io" },
          { status: 500 }
        );
      }
      const pdfBuffer = await pdfRes.arrayBuffer();
      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=users-report.pdf`,
        },
      });
    }
  } catch (error) {
    console.error("User export PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate user export PDF" },
      { status: 500 }
    );
  }
}
