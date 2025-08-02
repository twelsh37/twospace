// frontend/scripts/direct-db-reset.js

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

// Direct database password reset script (use as last resort)
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const readline = require("readline");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecurePassword() {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}

async function directDbReset() {
  console.log("🔧 DIRECT DATABASE PASSWORD RESET\n");
  console.log(
    "⚠️  WARNING: This is a last resort option. Use the Supabase Admin API when possible.\n"
  );

  try {
    // List all users from auth.users table
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching users:", error.message);
      return;
    }

    // Ensure we have an array of users
    const users = data?.users || [];

    if (users.length === 0) {
      console.log("❌ No users found in the system");
      return;
    }

    console.log("📋 Available users:");
    users.forEach((user, index) => {
      const metadata = user.user_metadata || {};
      const role = metadata.role || "USER";
      console.log(`${index + 1}. ${user.email} (${role}) - ${user.id}`);
    });

    const userChoice = await question(
      "\nEnter the number of the user to reset: "
    );
    const userIndex = parseInt(userChoice) - 1;

    if (userIndex < 0 || userIndex >= users.length) {
      console.log("❌ Invalid selection");
      rl.close();
      return;
    }

    const selectedUser = users[userIndex];
    const newPassword = generateSecurePassword();

    console.log(`\n🔄 Resetting password for: ${selectedUser.email}`);
    console.log(`🔑 New password will be: ${newPassword}\n`);

    const confirm = await question(
      "Are you sure you want to proceed? (yes/no): "
    );

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Operation cancelled");
      rl.close();
      return;
    }

    // Method 1: Try Supabase Admin API first
    console.log("🔄 Attempting password reset via Supabase Admin API...");

    const { error: adminError } = await supabase.auth.admin.updateUserById(
      selectedUser.id,
      { password: newPassword }
    );

    if (adminError) {
      console.log(`❌ Admin API failed: ${adminError.message}`);
      console.log("⚠️  You may need to use the Supabase Dashboard directly");
    } else {
      console.log("✅ Password reset successful via Admin API!");
      console.log(`🔑 New password for ${selectedUser.email}: ${newPassword}`);
    }

    console.log("\n📝 Next steps:");
    console.log("1. Provide the new password to the user securely");
    console.log("2. User should change password after first login");
    console.log("3. Check Supabase email settings to fix email delivery");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

directDbReset();
