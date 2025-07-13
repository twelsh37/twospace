# AUTH_README.md

> **Filepath:** `frontend/AUTH_README.md`

## Overview

This document explains how authentication works in this project, how to set up Supabase Auth, and how to manage users (add, edit, delete). It also covers security and audit best practices for a production-ready setup.

---

## 1. How Authentication Works

- **Supabase Auth** is used for user authentication (email/password).
- The app uses a React context (`lib/auth-context.tsx`) to manage user state and provide auth methods (`signIn`, `signUp`, `signOut`, `resetPassword`).
- All protected pages/components use the `ProtectedRoute` component to ensure only authenticated users can access them.
- User sessions are managed by Supabase and synced with the app on login/logout.

---

## 2. Setting Up Supabase Auth

### Prerequisites

- You need access to the Supabase project dashboard.
- Ensure the following environment variables are set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Steps

1. **Create a Supabase Project** (if not already done)
   - Go to [Supabase](https://app.supabase.com/), create a new project, and note the URL and anon key.
2. **Configure Environment Variables**
   - Add your Supabase URL and anon key to `.env.local` in the frontend directory.
3. **Enable Email Auth**
   - In the Supabase dashboard, go to `Authentication > Providers` and enable "Email".
   - Optionally, enable email confirmations for extra security.
4. **(Optional) Set Up OAuth Providers**
   - You can enable Google, Microsoft, etc. for SSO if desired.

---

## 3. Managing Users

### Adding Users

- **Via Supabase Dashboard:**
  1. Go to `Authentication > Users` in the Supabase dashboard.
  2. Click "Invite user" to send an email invite, or "Create user" to add directly.
  3. Set the email and password. For the initial admin, use the desired admin email and a strong password.
- **Via App Sign-Up:**
  - Users can sign up via the app's sign-up page (if enabled).

### Demo User Setup

If you're having trouble logging in with the demo user (`demo@example.com`), it's likely because the user exists in the application database but not in Supabase Auth. To fix this:

1. **Quick Fix (Recommended):**

   ```bash
   # Add your Supabase service role key to .env.local first
   cd frontend
   node scripts/setup-demo-user.js
   ```

2. **Manual Setup:**

   - Go to Supabase Dashboard > Authentication > Users
   - Create user: `demo@example.com` / `password01`
   - Check "Auto-confirm email"

3. **For Windows Users:**
   ```powershell
   cd frontend
   .\scripts\setup-demo-user.ps1
   ```

See `scripts/fix-auth-issue.md` for detailed troubleshooting.

- **Via API:**
  - Use the Supabase Admin API to programmatically create users (see Supabase docs).

### Editing Users

- **Change Email/Password:**
  - In the Supabase dashboard, select a user and edit their details.
  - Users can also reset their password via the app's "Forgot password" flow.
- **Assigning Roles:**
  - Use user metadata or a dedicated roles table to assign roles (e.g., admin, user).
  - Update roles via the dashboard or API as needed.

### Deleting Users

- **Via Supabase Dashboard:**
  - Select the user and click "Delete".
- **Via API:**
  - Use the Supabase Admin API to delete users programmatically.

---

## 4. Security Best Practices

- **Use strong, unique passwords for all users.**
- **Never hardcode credentials in the codebase.**
- **Enable email verification** to prevent fake accounts.
- **Set up Row Level Security (RLS)** in Supabase to restrict data access by user/role.
- **Use HTTPS** in production to protect user data.
- **Store secrets in environment variables** (never in code).
- **Regularly review user roles and permissions.**
- **Rotate admin credentials periodically.**

---

## 5. Auditing & Monitoring

- **Supabase provides logs** for all authentication events (login, sign-up, password reset, etc.).
- **For extra auditability:**
  - Create a custom audit log table for critical actions (user creation, deletion, role changes).
  - Log all admin actions in the app (optional, for compliance).
- **Review logs regularly** for suspicious activity.

---

## 6. Creating the Initial Admin User

- **Best Practice:** Create the initial admin user directly in the Supabase dashboard for security.
- **Assign the admin role** using user metadata or a roles table.
- **Do not use weak or guessable passwords.**
- **Document the admin credentials securely** (never in code or public docs).

---

## 7. Useful Links

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/auth-admin-api)
- [Supabase Dashboard](https://app.supabase.com/)

---

## 8. Comments & Reasoning

- This setup uses Supabase's secure, scalable auth system.
- All sensitive operations are handled outside the codebase for security.
- The app is ready for production with minimal changes needed for scaling and compliance.
- For any questions, see the code comments in `lib/auth-context.tsx` and `components/auth/protected-route.tsx`.

---

## 9. Authentication Event Logging

- All authentication-related events (login, logout, sign-up, password reset, errors) are logged to the system log (`/logs/system.log_YYYYMMDD.log`).
- Logs include timestamp, user email (where available), event type, and error details (if any).
- **Admins**: Review these logs regularly to audit authentication activity and investigate issues.
- **Log Location**: `/logs/`
- **Log Review**: Open the relevant log file and search for auth-related events (e.g., `login`, `
