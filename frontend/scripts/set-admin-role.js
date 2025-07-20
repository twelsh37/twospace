// frontend/scripts/set-admin-role.js
// Script to set ADMIN role for a user in Supabase Auth metadata

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdminRole(email) {
  try {
    console.log(`Setting ADMIN role for user: ${email}`);

    // First, check if user exists
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error fetching users:", listError);
      return;
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.log(`❌ User ${email} not found. Please create the user first.`);
      return;
    }

    console.log("User found:", user.email);
    console.log("Current metadata:", user.user_metadata);

    // Update user metadata to include ADMIN role
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: "ADMIN",
      },
    });

    if (error) {
      console.error("❌ Error updating user role:", error);
      return;
    }

    console.log("✅ Successfully set ADMIN role for user:", data.user.email);
    console.log("Updated metadata:", data.user.user_metadata);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/set-admin-role.js <email>");
  console.error(
    "Example: node scripts/set-admin-role.js tom.welsh@gtrailway.com"
  );
  process.exit(1);
}

setAdminRole(email)
  .then(() => {
    console.log("\n=== Done ===");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
