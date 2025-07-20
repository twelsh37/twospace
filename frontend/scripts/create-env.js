// frontend/scripts/create-env.js
// Script to create .env.local file with Supabase configuration

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log("⚠️  .env.local already exists!");
  console.log(
    "If you want to update it, please delete the existing file first."
  );
  process.exit(0);
}

// Template for .env.local
const envTemplate = `# Supabase Configuration
# Replace these values with your actual Supabase project credentials

# Supabase Project URL (from Settings > API in your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon Key (from Settings > API in your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Direct Database Connection String (from Settings > Database in your Supabase dashboard)
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
POSTGRES_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Environment
NODE_ENV=development
`;

try {
  // Write the template to .env.local
  fs.writeFileSync(envPath, envTemplate);

  console.log("✅ .env.local template created successfully!");
  console.log("");
  console.log("🔧 Next steps:");
  console.log(
    "1. Open .env.local and replace the placeholder values with your actual Supabase credentials"
  );
  console.log("2. Get your credentials from your Supabase dashboard:");
  console.log(
    "   - Go to Settings > API for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  console.log("   - Go to Settings > Database for POSTGRES_URL");
  console.log("3. Run the database optimization: yarn db:optimize");
  console.log("");
  console.log(
    "🔒 Important: .env.local is in .gitignore to keep your credentials secure!"
  );
} catch (error) {
  console.error("❌ Error creating .env.local:", error.message);
  process.exit(1);
}
