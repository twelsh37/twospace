// frontend/scripts/optimize-database.js
// Database Optimization Script for Asset Management System
// Executes indexing strategies to improve query performance on Supabase PostgreSQL

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Load environment variables from .env.local (matching the main db config)
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Database connection configuration for Supabase
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Supabase requires SSL but allows self-signed certificates
    ca: undefined, // Don't verify certificate authority
    checkServerIdentity: () => undefined, // Skip hostname verification
  },
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

/**
 * Execute SQL script from file
 * @param {string} filePath - Path to SQL file
 * @returns {Promise<void>}
 */
async function executeSqlFile(filePath) {
  try {
    console.log(`📖 Reading SQL file: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, "utf8");

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`🔧 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(
            `  [${i + 1}/${statements.length}] Executing statement...`
          );
          await pool.query(statement);
          console.log(`  ✅ Statement ${i + 1} completed successfully`);
        } catch (error) {
          // Skip if index already exists or extension already enabled
          if (
            error.message.includes("already exists") ||
            error.message.includes('extension "pg_trgm" already exists')
          ) {
            console.log(
              `  ⚠️  Statement ${i + 1} skipped (already exists): ${
                error.message
              }`
            );
          } else {
            console.error(`  ❌ Statement ${i + 1} failed: ${error.message}`);
            throw error;
          }
        }
      }
    }

    console.log("✅ All SQL statements executed successfully");
  } catch (error) {
    console.error("❌ Error executing SQL file:", error);
    throw error;
  }
}

/**
 * Get database performance statistics
 * @returns {Promise<Object>}
 */
async function getPerformanceStats() {
  try {
    console.log("📊 Gathering performance statistics...");

    // Get table sizes
    const tableSizes = await pool.query(`
      SELECT
        nspname as schemaname,
        relname as tablename,
        pg_size_pretty(pg_total_relation_size(c.oid)) as size,
        pg_total_relation_size(c.oid) as size_bytes
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE nspname = 'public' AND relkind = 'r'
      ORDER BY pg_total_relation_size(c.oid) DESC
    `);

    // Get index usage statistics
    const indexUsage = await pool.query(`
      SELECT
        s.schemaname,
        c.relname AS tablename,
        s.indexrelname AS indexname,
        s.idx_scan AS scans,
        s.idx_tup_read AS tuples_read,
        s.idx_tup_fetch AS tuples_fetched
      FROM pg_stat_user_indexes s
      JOIN pg_class c ON c.oid = s.relid
      WHERE s.schemaname = 'public'
      ORDER BY s.idx_scan DESC
    `);

    // Get slow query statistics (if pg_stat_statements is available)
    let slowQueries = [];
    try {
      const slowQueriesResult = await pool.query(`
        SELECT
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements
        WHERE query LIKE '%assets%' OR query LIKE '%users%' OR query LIKE '%locations%'
        ORDER BY mean_time DESC
        LIMIT 10
      `);
      slowQueries = slowQueriesResult.rows;
    } catch (error) {
      console.log(
        "⚠️  pg_stat_statements extension not available for slow query monitoring"
      );
    }

    // Get index sizes
    const indexSizes = await pool.query(`
      SELECT
        nsp.nspname as schemaname,
        cls.relname as indexname,
        tbl.relname as tablename,
        pg_size_pretty(pg_relation_size(cls.oid)) as size
      FROM pg_class cls
      JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
      JOIN pg_index idx ON idx.indexrelid = cls.oid
      JOIN pg_class tbl ON tbl.oid = idx.indrelid
      WHERE nsp.nspname = 'public'
      ORDER BY pg_relation_size(cls.oid) DESC
    `);

    return {
      tableSizes: tableSizes.rows,
      indexUsage: indexUsage.rows,
      slowQueries,
      indexSizes: indexSizes.rows,
    };
  } catch (error) {
    console.error("❌ Error gathering performance statistics:", error);
    throw error;
  }
}

/**
 * Display performance statistics in a formatted way
 * @param {Object} stats - Performance statistics
 */
function displayPerformanceStats(stats) {
  console.log("\n📊 DATABASE PERFORMANCE STATISTICS");
  console.log("=====================================\n");

  // Table sizes
  console.log("📋 TABLE SIZES:");
  console.log("----------------");
  stats.tableSizes.forEach((table) => {
    console.log(`${table.tablename.padEnd(20)} ${table.size.padStart(10)}`);
  });

  // Index usage
  console.log("\n🔍 INDEX USAGE (Top 10):");
  console.log("-------------------------");
  stats.indexUsage.slice(0, 10).forEach((index) => {
    console.log(
      `${index.indexname.padEnd(40)} ${index.scans
        .toString()
        .padStart(8)} scans`
    );
  });

  // Index sizes
  console.log("\n💾 INDEX SIZES (Top 10):");
  console.log("-------------------------");
  stats.indexSizes.slice(0, 10).forEach((index) => {
    console.log(`${index.indexname.padEnd(40)} ${index.size.padStart(10)}`);
  });

  // Slow queries
  if (stats.slowQueries.length > 0) {
    console.log("\n🐌 SLOW QUERIES (Top 5):");
    console.log("------------------------");
    stats.slowQueries.slice(0, 5).forEach((query, index) => {
      console.log(
        `${index + 1}. Mean time: ${query.mean_time.toFixed(2)}ms, Calls: ${
          query.calls
        }`
      );
      console.log(`   Query: ${query.query.substring(0, 100)}...`);
      console.log("");
    });
  }

  // Unused indexes
  const unusedIndexes = stats.indexUsage.filter((index) => index.scans === 0);
  if (unusedIndexes.length > 0) {
    console.log("\n⚠️  UNUSED INDEXES:");
    console.log("------------------");
    unusedIndexes.forEach((index) => {
      console.log(`- ${index.indexname}`);
    });
  }
}

/**
 * Test query performance
 * @returns {Promise<void>}
 */
async function testQueryPerformance() {
  try {
    console.log("\n🧪 TESTING QUERY PERFORMANCE...");
    console.log("================================\n");

    const testQueries = [
      {
        name: "Assets by type and state",
        query:
          "SELECT COUNT(*) FROM assets WHERE type = $1 AND state = $2 AND deleted_at IS NULL",
        params: ["LAPTOP", "AVAILABLE"],
      },
      {
        name: "Assets with location join",
        query: `
          SELECT a.asset_number, l.name as location_name
          FROM assets a
          LEFT JOIN locations l ON a.location_id = l.id
          WHERE a.deleted_at IS NULL
          LIMIT 100
        `,
        params: [],
      },
      {
        name: "Asset search",
        query:
          "SELECT asset_number FROM assets WHERE asset_number ILIKE $1 AND deleted_at IS NULL LIMIT 50",
        params: ["%LAP%"],
      },
      {
        name: "Recent asset history",
        query: `
          SELECT ah.timestamp, u.name as user_name
          FROM asset_history ah
          LEFT JOIN users u ON ah.changed_by = u.id
          ORDER BY ah.timestamp DESC
          LIMIT 20
        `,
        params: [],
      },
      {
        name: "Dashboard aggregation",
        query: `
          SELECT
            state,
            COUNT(*) as count,
            SUM(purchase_price) as total_value
          FROM assets
          WHERE deleted_at IS NULL
          GROUP BY state
        `,
        params: [],
      },
    ];

    for (const test of testQueries) {
      const start = Date.now();
      const result = await pool.query(test.query, test.params);
      const duration = Date.now() - start;

      console.log(
        `${test.name.padEnd(30)} ${duration.toString().padStart(5)}ms (${
          result.rowCount
        } rows)`
      );
    }
  } catch (error) {
    console.error("❌ Error testing query performance:", error);
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  try {
    console.log("🚀 Starting database optimization...");
    console.log("====================================\n");

    // Test database connection
    console.log("🔌 Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Get initial performance stats
    console.log("📊 Getting initial performance statistics...");
    const initialStats = await getPerformanceStats();

    // Execute optimization script
    const sqlFilePath = path.join(__dirname, "../lib/db/optimize-indexes.sql");
    await executeSqlFile(sqlFilePath);

    // Wait a moment for indexes to be fully created
    console.log("\n⏳ Waiting for indexes to be fully created...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get final performance stats
    console.log("📊 Getting final performance statistics...");
    const finalStats = await getPerformanceStats();

    // Display performance statistics
    displayPerformanceStats(finalStats);

    // Test query performance
    await testQueryPerformance();

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Database optimization completed in ${totalTime}ms`);
  } catch (error) {
    console.error("❌ Database optimization failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  executeSqlFile,
  getPerformanceStats,
  testQueryPerformance,
};
