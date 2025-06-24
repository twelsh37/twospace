// backend/app/mon/page.tsx
// A monitoring page to check database connection and table counts.

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function getDbStatus() {
  try {
    // A simple query to check if the database is responsive.
    await db.execute(sql`SELECT 1`);
    return { isConnected: true, error: null };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getTableCounts() {
  // Explicitly list the tables we want to count
  const tables = [
    { name: "usersTable", table: schema.usersTable },
    { name: "locationsTable", table: schema.locationsTable },
    { name: "assetsTable", table: schema.assetsTable },
    { name: "assetHistoryTable", table: schema.assetHistoryTable },
    { name: "assetAssignmentsTable", table: schema.assetAssignmentsTable },
    { name: "assetSequencesTable", table: schema.assetSequencesTable },
  ];

  const counts: { tableName: string; count: number }[] = [];

  for (const { name, table } of tables) {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(table);
      counts.push({ tableName: name, count: result[0]?.count || 0 });
    } catch (error) {
      console.error(`Error counting rows for ${name}:`, error);
      counts.push({ tableName: name, count: -1 }); // Indicate an error
    }
  }
  return counts;
}

export default async function MonitorPage() {
  const status = await getDbStatus();
  const tableCounts = status.isConnected ? await getTableCounts() : [];

  const indicatorStyle = {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: status.isConnected ? "green" : "red",
    border: "2px solid black",
    display: "inline-block",
    marginRight: "10px",
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "20px" }}>
      <h1>Database Monitor</h1>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
      >
        <span style={indicatorStyle}></span>
        <span>{status.isConnected ? "Connected" : "Disconnected"}</span>
      </div>

      {status.error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <strong>Error:</strong> {status.error}
        </div>
      )}

      <h2>Table Row Counts</h2>
      {status.isConnected ? (
        <table style={{ borderCollapse: "collapse", width: "300px" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Table Name
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Row Count
              </th>
            </tr>
          </thead>
          <tbody>
            {tableCounts.map(({ tableName, count }) => (
              <tr key={tableName}>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {tableName}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {count === -1 ? "Error" : count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Cannot fetch table counts, database is not connected.</p>
      )}
    </div>
  );
}
