// frontend/jest.global-setup.js
// Global setup for Jest tests in CI environment

module.exports = async () => {
  // Set up any global test environment variables
  process.env.NODE_ENV = "test";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

  // Set up test database URL if needed
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

    // Set up any global mocks or configurations
  global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });

  console.log("Jest global setup completed");
};
