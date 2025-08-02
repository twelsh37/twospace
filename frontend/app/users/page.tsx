// frontend/app/users/page.tsx
// User management page

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

import { db, usersTable, departmentsTable, locationsTable } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";
import UsersClientPage from "@/components/users/users-client-page";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, undefined | string | string[]>>;
}) {
  // Await searchParams as required by Next.js 15
  const resolvedSearchParams = await searchParams;
  const getParam = (key: string, fallback: string) => {
    const value = resolvedSearchParams[key];
    if (Array.isArray(value)) return value[0] ?? fallback;
    return value ?? fallback;
  };
  const department = getParam("department", "ALL").toUpperCase();
  const role = getParam("role", "ALL").toUpperCase();
  const page = parseInt(getParam("page", "1"), 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (department && department !== "ALL") {
    conditions.push(eq(usersTable.departmentId, department));
  }
  if (role && role !== "ALL") {
    const roleValue = role === "ADMIN" ? "ADMIN" : "USER";
    conditions.push(eq(usersTable.role, roleValue));
  }

  // Get total count for pagination (use SQL COUNT for performance)
  let totalCount = 0;
  if (conditions.length > 0) {
    const [{ value }] = await db
      .select({ value: count() })
      .from(usersTable)
      .where(and(...conditions));
    totalCount = Number(value) || 0;
  } else {
    const [{ value }] = await db.select({ value: count() }).from(usersTable);
    totalCount = Number(value) || 0;
  }
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // Get paginated users, join departments and locations for names
  let users;
  if (conditions.length > 0) {
    users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        department: departmentsTable.name,
        location: locationsTable.name,
        isActive: usersTable.isActive,
        employeeId: usersTable.employeeId,
      })
      .from(usersTable)
      .leftJoin(
        departmentsTable,
        eq(usersTable.departmentId, departmentsTable.id)
      )
      .leftJoin(locationsTable, eq(usersTable.locationId, locationsTable.id))
      .where(and(...conditions))
      .orderBy(usersTable.name)
      .limit(limit)
      .offset(offset);
  } else {
    users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        department: departmentsTable.name,
        location: locationsTable.name,
        isActive: usersTable.isActive,
        employeeId: usersTable.employeeId,
      })
      .from(usersTable)
      .leftJoin(
        departmentsTable,
        eq(usersTable.departmentId, departmentsTable.id)
      )
      .leftJoin(locationsTable, eq(usersTable.locationId, locationsTable.id))
      .orderBy(usersTable.name)
      .limit(limit)
      .offset(offset);
  }

  // Fetch all departments for filter dropdown
  const departmentsResult = await db
    .select({ id: departmentsTable.id, name: departmentsTable.name })
    .from(departmentsTable)
    .orderBy(departmentsTable.name);

  // Deduplicate by name, but keep id (similar to departments API route)
  const seen = new Set<string>();
  const departments = departmentsResult
    .filter((row) => {
      if (!row.name || seen.has(row.name.toUpperCase())) return false;
      seen.add(row.name.toUpperCase());
      return true;
    })
    .map((row) => ({ ...row, name: row.name.toUpperCase() }));

  // Prepare filters object for the filter component
  const filters = {
    department,
    role,
  };

  // Pagination info
  const pagination = {
    page,
    limit,
    totalUsers: totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return (
    <UsersClientPage
      users={users}
      departments={departments}
      filters={filters}
      pagination={pagination}
    />
  );
}
