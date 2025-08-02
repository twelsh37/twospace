// frontend/scripts/simple-admin-reset.js

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

// Simple emergency admin password reset script
const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");

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

async function simpleAdminReset() {
  console.log("🚨 SIMPLE ADMIN PASSWORD RESET\n");
  console.log(
    "This script will help you reset admin passwords when email is not working.\n"
  );

  try {
    // First, let's check if we can connect to Supabase
    console.log("🔍 Connecting to Supabase...");

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error connecting to Supabase:", error.message);
      console.log("\nPossible issues:");
      console.log("1. Check your .env.local file has correct credentials");
      console.log("2. Verify your SUPABASE_SERVICE_ROLE_KEY is correct");
      console.log("3. Ensure you have admin access to the Supabase project");
      return;
    }

    console.log("✅ Successfully connected to Supabase");

    // Safely extract users array
    const users = data?.users || [];

    if (users.length === 0) {
      console.log("❌ No users found in the system");
      return;
    }

    console.log(`📊 Found ${users.length} user(s) in the system\n`);

    // Display users
    console.log("📋 Available users:");
    users.forEach((user, index) => {
      const metadata = user.user_metadata || {};
      const role = metadata.role || "USER";
      console.log(`${index + 1}. ${user.email} (${role})`);
    });

    // Get user choice
    const userChoice = await question(
      '\nEnter the number of the user to reset (or "all" for all users): '
    );

    let usersToReset = [];

    if (userChoice.toLowerCase() === "all") {
      usersToReset = users;
    } else {
      const userIndex = parseInt(userChoice) - 1;
      if (userIndex >= 0 && userIndex < users.length) {
        usersToReset = [users[userIndex]];
      } else {
        console.log("❌ Invalid selection");
        rl.close();
        return;
      }
    }

    console.log(
      `\n🔄 Resetting passwords for ${usersToReset.length} user(s)...\n`
    );

    // Reset passwords
    for (const user of usersToReset) {
      const newPassword = generateSecurePassword();

      console.log(`📧 Resetting password for: ${user.email}`);

      const { error: resetError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (resetError) {
        console.log(`❌ Failed to reset ${user.email}: ${resetError.message}`);
      } else {
        console.log(`✅ Successfully reset password for ${user.email}`);
        console.log(`🔑 New password: ${newPassword}`);
        console.log("⚠️  Please provide this password to the user securely!\n");
      }
    }

    console.log("✅ Password reset process completed!");
    console.log("\n📝 Next steps:");
    console.log("1. Provide the new passwords to users securely");
    console.log("2. Users should change their passwords after first login");
    console.log("3. Check your Supabase email settings to fix the email issue");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    console.log("\nDebugging info:");
    console.log("- Check your internet connection");
    console.log("- Verify Supabase project is active");
    console.log("- Ensure service role key has admin permissions");
  } finally {
    rl.close();
  }
}

simpleAdminReset();
