// Usage: npx tsx set-admin-role.ts
// You need to update SUPABASE_URL,SERVICE_ROLE_KEY and userId with your own values
// Add dependancies 'yarn add @supabase/supabase-js'
// // Usage: node set-admin-role.js

// set-admin-role.ts

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

import { createClient } from "@supabase/supabase-js";

// Replace with your actual values:
const SUPABASE_URL = "https://your-project.supabase.co"; // <-- your project URL
const SERVICE_ROLE_KEY = "your-service-role-key"; // <-- your service role key
const SUPABASE_AUTH_USER_ID = "your-supabase-auth-user-id"; // The user's UUID

const userId = SUPABASE_AUTH_USER_ID; // The user's UUID

async function setAdminRole() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: "ADMIN" },
  });

  if (error) {
    console.error("Error updating user role:", error.message, error);
  } else {
    console.log("User updated successfully:", data);
  }
}

setAdminRole();
