// frontend/scripts/debug-connection.js

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Debug script to troubleshoot Supabase connection issues
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔍 DEBUGGING SUPABASE CONNECTION\n");

// Check environment variables
console.log("📋 Environment Variables:");
console.log(
  `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`
);
console.log(
  `SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✅ Set" : "❌ Missing"}`
);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("\n❌ Missing required environment variables");
  console.log("Please check your .env.local file contains:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Show partial URLs for verification (without exposing full keys)
console.log(`\n🔗 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugConnection() {
  try {
    console.log("\n🔄 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Connection failed:", error.message);
      console.log("\n🔧 Troubleshooting steps:");
      console.log("1. Check your internet connection");
      console.log("2. Verify the Supabase URL is correct");
      console.log("3. Ensure the service role key is valid");
      console.log("4. Check if your Supabase project is active");
      console.log("5. Verify you have admin access to the project");
      return;
    }

    console.log("✅ Successfully connected to Supabase!");

    // Safely extract users array
    const users = data?.users || [];
    console.log(`📊 Found ${users.length} user(s) in the system`);

    if (users.length > 0) {
      console.log("\n👥 Users found:");
      users.forEach((user, index) => {
        const metadata = user.user_metadata || {};
        const role = metadata.role || "USER";
        console.log(`  ${index + 1}. ${user.email} (${role})`);
      });
    } else {
      console.log("\n⚠️  No users found in the system");
    }

    console.log("\n✅ Connection test completed successfully!");
    console.log("You can now run the password reset scripts.");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    console.log("\n🔧 Additional troubleshooting:");
    console.log("- Check if Supabase is experiencing downtime");
    console.log("- Verify your project hasn't been paused");
    console.log("- Ensure your service role key has admin permissions");
  }
}

debugConnection();
