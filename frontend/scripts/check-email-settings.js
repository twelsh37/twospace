// frontend/scripts/check-email-settings.js

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

// Script to check and configure Supabase email settings
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log("Please check your .env.local file contains:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEmailSettings() {
  console.log("🔍 Checking Supabase email settings...\n");

  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error connecting to Supabase:", error.message);
      return;
    }

    // Ensure we have an array of users
    const users = data?.users || [];

    console.log("✅ Successfully connected to Supabase");
    console.log(`📊 Found ${users.length} users in the system\n`);

    // List admin users
    const adminUsers = users.filter((user) => {
      const metadata = user.user_metadata || {};
      return metadata.role === "ADMIN" || metadata.role === "admin";
    });

    if (adminUsers.length > 0) {
      console.log("👑 Admin users found:");
      adminUsers.forEach((user) => {
        console.log(`  - ${user.email} (${user.id})`);
      });
    } else {
      console.log("⚠️  No admin users found with role metadata");
    }

    console.log("\n📧 Email Configuration Steps:");
    console.log("1. Go to your Supabase Dashboard");
    console.log("2. Navigate to Authentication > Settings");
    console.log('3. Check "Enable email confirmations" is ON');
    console.log('4. Check "Enable email change confirmations" is ON');
    console.log("5. Verify your SMTP settings or use Supabase email service");
    console.log("6. Test email delivery in the Email Templates section");

    console.log("\n🔧 Manual Password Reset Options:");
    console.log("Option 1: Use the admin password reset API");
    console.log("Option 2: Reset password directly in Supabase Dashboard");
    console.log("Option 3: Use the database to update password hash");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkEmailSettings();
