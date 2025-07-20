// frontend/jest.global-teardown.js
// Global teardown for Jest tests in CI environment

module.exports = async () => {
  // Clean up any global resources
  if (global.fetch) {
    global.fetch.mockClear();
  }

  // Clear any remaining timers
  jest.clearAllTimers();

  // Clear any remaining mocks
  jest.clearAllMocks();

  console.log("Jest global teardown completed");
};
