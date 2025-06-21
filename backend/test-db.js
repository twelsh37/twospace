// Test database connection
require("dotenv").config({ path: ".env.local" });

console.log("Environment check:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

if (!process.env.DATABASE_URL) {
  console.log("Please create a .env.local file with your DATABASE_URL");
  console.log("Example:");
  console.log(
    'DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"'
  );
}
