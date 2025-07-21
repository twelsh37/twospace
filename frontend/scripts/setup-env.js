// backend/scripts/setup-env.js

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

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log("🔧 Database Environment Setup");
  console.log("==============================\n");

  // Check if .env.local exists
  const envPath = path.join(__dirname, "../.env.local");
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    console.log("✅ .env.local file found");
    const envContent = fs.readFileSync(envPath, "utf8");

    if (envContent.includes("POSTGRES_URL=")) {
      console.log("✅ POSTGRES_URL is already configured");
      console.log("\nYou can now run: yarn db:optimize");
      rl.close();
      return;
    }
  }

  console.log("📝 Setting up database connection...\n");

  // Get Neon connection details
  const host = await question(
    "Enter your Neon database host (e.g., ep-cool-name-123456.us-east-1.aws.neon.tech): "
  );
  const database = await question("Enter your database name (e.g., neondb): ");
  const username = await question("Enter your database username: ");
  const password = await question("Enter your database password: ");

  // Construct the connection string
  const postgresUrl = `postgresql://${username}:${password}@${host}/${database}?sslmode=require`;

  // Create .env.local content
  const envContent = `# Database Configuration
POSTGRES_URL="${postgresUrl}"

# Environment
NODE_ENV=development
`;

  // Write to .env.local
  fs.writeFileSync(envPath, envContent);

  console.log("\n✅ Environment configuration saved to .env.local");
  console.log(
    "\n🔒 Important: Make sure .env.local is in your .gitignore file to keep your credentials secure!"
  );
  console.log("\n🚀 You can now run: yarn db:optimize");

  rl.close();
}

setupEnvironment().catch(console.error);
