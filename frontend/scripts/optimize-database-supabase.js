// frontend/scripts/optimize-database-supabase.js

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

// Database Optimization Script for Asset Management System using Supabase
// Executes indexing strategies to improve query performance on Supabase PostgreSQL

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables from .env.local
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Execute SQL script from file using Supabase
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

          // Execute SQL using Supabase's rpc function for raw SQL
          const { error } = await supabase.rpc("exec_sql", {
            sql_query: statement,
          });

          if (error) {
            // Check if it's an "already exists" error
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
              throw error;
            }
          } else {
            console.log(`  ✅ Statement ${i + 1} completed successfully`);
          }
        } catch (error) {
          console.error(`  ❌ Statement ${i + 1} failed: ${error.message}`);
          throw error;
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
 * Get database performance statistics using Supabase
 * @returns {Promise<Object>}
 */
async function getPerformanceStats() {
  try {
    console.log("📊 Gathering performance statistics...");

    // Get table sizes
    const { data: tableSizes, error: tableError } = await supabase.rpc(
      "get_table_sizes"
    );
    if (tableError) throw tableError;

    // Get index usage statistics
    const { data: indexUsage, error: indexError } = await supabase.rpc(
      "get_index_usage"
    );
    if (indexError) throw indexError;

    // Get slow query statistics (if available)
    let slowQueries = [];
    try {
      const { data: slowQueriesData, error: slowError } = await supabase.rpc(
        "get_slow_queries"
      );
      if (!slowError) {
        slowQueries = slowQueriesData || [];
      }
    } catch (error) {
      console.log("⚠️  Slow query monitoring not available");
    }

    // Get index sizes
    const { data: indexSizes, error: sizeError } = await supabase.rpc(
      "get_index_sizes"
    );
    if (sizeError) throw sizeError;

    return {
      tableSizes: tableSizes || [],
      indexUsage: indexUsage || [],
      slowQueries,
      indexSizes: indexSizes || [],
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
 * Test query performance using Supabase client
 * @returns {Promise<void>}
 */
async function testQueryPerformance() {
  try {
    console.log("\n🧪 TESTING QUERY PERFORMANCE...");
    console.log("================================\n");

    const testQueries = [
      {
        name: "Assets by type and state",
        query: async () => {
          const { data, error } = await supabase
            .from("assets")
            .select("id", { count: "exact" })
            .eq("type", "LAPTOP")
            .eq("state", "AVAILABLE")
            .is("deleted_at", null);
          if (error) throw error;
          return data;
        },
      },
      {
        name: "Assets with location join",
        query: async () => {
          const { data, error } = await supabase
            .from("assets")
            .select(
              `
              asset_number,
              locations!inner(name)
            `
            )
            .is("deleted_at", null)
            .limit(100);
          if (error) throw error;
          return data;
        },
      },
      {
        name: "Asset search",
        query: async () => {
          const { data, error } = await supabase
            .from("assets")
            .select("asset_number")
            .ilike("asset_number", "%LAP%")
            .is("deleted_at", null)
            .limit(50);
          if (error) throw error;
          return data;
        },
      },
      {
        name: "Recent asset history",
        query: async () => {
          const { data, error } = await supabase
            .from("asset_history")
            .select(
              `
              created_at,
              users!inner(name)
            `
            )
            .order("created_at", { ascending: false })
            .limit(20);
          if (error) throw error;
          return data;
        },
      },
      {
        name: "Dashboard aggregation",
        query: async () => {
          const { data, error } = await supabase
            .from("assets")
            .select("state, purchase_price")
            .is("deleted_at", null);
          if (error) throw error;
          return data;
        },
      },
    ];

    for (const test of testQueries) {
      const start = Date.now();
      try {
        const result = await test.query();
        const duration = Date.now() - start;
        console.log(
          `${test.name.padEnd(30)} ${duration.toString().padStart(5)}ms (${
            result?.length || 0
          } rows)`
        );
      } catch (error) {
        const duration = Date.now() - start;
        console.log(
          `${test.name.padEnd(30)} ${duration
            .toString()
            .padStart(5)}ms (ERROR: ${error.message})`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error testing query performance:", error);
  }
}

/**
 * Create helper functions in Supabase for performance monitoring
 * @returns {Promise<void>}
 */
async function createHelperFunctions() {
  try {
    console.log("🔧 Creating helper functions for performance monitoring...");

    const helperFunctions = [
      // Function to get table sizes
      `
      CREATE OR REPLACE FUNCTION get_table_sizes()
      RETURNS TABLE(schemaname text, tablename text, size text, size_bytes bigint)
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        SELECT
          nspname as schemaname,
          relname as tablename,
          pg_size_pretty(pg_total_relation_size(c.oid)) as size,
          pg_total_relation_size(c.oid) as size_bytes
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE nspname = 'public' AND relkind = 'r'
        ORDER BY pg_total_relation_size(c.oid) DESC;
      $$;
      `,

      // Function to get index usage
      `
      CREATE OR REPLACE FUNCTION get_index_usage()
      RETURNS TABLE(schemaname text, tablename text, indexname text, scans bigint, tuples_read bigint, tuples_fetched bigint)
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
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
        ORDER BY s.idx_scan DESC;
      $$;
      `,

      // Function to get index sizes
      `
      CREATE OR REPLACE FUNCTION get_index_sizes()
      RETURNS TABLE(schemaname text, indexname text, tablename text, size text)
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
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
        ORDER BY pg_relation_size(cls.oid) DESC;
      $$;
      `,

      // Function to execute raw SQL (for admin operations)
      `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
      `,
    ];

    for (let i = 0; i < helperFunctions.length; i++) {
      const functionSql = helperFunctions[i];
      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql_query: functionSql,
        });
        if (error) {
          console.log(
            `  ⚠️  Helper function ${i + 1} creation skipped: ${error.message}`
          );
        } else {
          console.log(`  ✅ Helper function ${i + 1} created successfully`);
        }
      } catch (error) {
        console.log(
          `  ⚠️  Helper function ${i + 1} creation skipped: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error creating helper functions:", error);
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  try {
    console.log("🚀 Starting Supabase database optimization...");
    console.log("=============================================\n");

    // Test Supabase connection
    console.log("🔌 Testing Supabase connection...");
    const { data, error } = await supabase.from("assets").select("id").limit(1);
    if (error) throw error;
    console.log("✅ Supabase connection successful\n");

    // Create helper functions
    await createHelperFunctions();

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
    console.log(
      `\n✅ Supabase database optimization completed in ${totalTime}ms`
    );
  } catch (error) {
    console.error("❌ Supabase database optimization failed:", error);
    process.exit(1);
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
  createHelperFunctions,
};
