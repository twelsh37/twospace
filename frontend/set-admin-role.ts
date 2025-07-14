// Usage: npx tsx set-admin-role.ts
// You need to update SUPABASE_URL,SERVICE_ROLE_KEY and userId with your own values
// Add dependancies 'yarn add @supabase/supabase-js'
// // Usage: node set-admin-role.js

// set-admin-role.ts


import { createClient } from '@supabase/supabase-js';

// Replace with your actual values:
const SUPABASE_URL = 'https://your-project.supabase.co'; // <-- your project URL
const SERVICE_ROLE_KEY = 'your-service-role-key'; // <-- your service role key
const SUPABASE_AUTH_USER_ID = 'your-supabase-auth-user-id'; // The user's UUID

const userId = SUPABASE_AUTH_USER_ID; // The user's UUID

async function setAdminRole() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'ADMIN' }
  });

  if (error) {
    console.error('Error updating user role:', error.message, error);
  } else {
    console.log('User updated successfully:', data);
  }
}

setAdminRole();
