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
  const tableNames = Object.keys(schema).filter((key) => key.endsWith("Table"));
  const counts: { tableName: string; count: number }[] = [];

  for (const tableName of tableNames) {
    try {
      const table = schema[tableName as keyof typeof schema];
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(table);
      counts.push({ tableName, count: result[0]?.count || 0 });
    } catch (error) {
      console.error(`Error counting rows for ${tableName}:`, error);
      counts.push({ tableName, count: -1 }); // Indicate an error
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
