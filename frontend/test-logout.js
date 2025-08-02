// Simple test script to verify logout functionality
// Run this in the browser console to test logout

console.log("Testing logout functionality...");

// Test 1: Check if auth context is available
if (typeof window !== "undefined") {
  console.log("Window is available");

  // Test 2: Check if Supabase client is available
  if (window.supabase) {
    console.log("Supabase client is available");
  } else {
    console.log("Supabase client not found in window object");
  }

  // Test 3: Check localStorage for auth tokens
  const authKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("sb-")
  );
  console.log("Auth keys in localStorage:", authKeys);

  // Test 4: Check sessionStorage for auth tokens
  const sessionAuthKeys = Object.keys(sessionStorage).filter((key) =>
    key.startsWith("sb-")
  );
  console.log("Auth keys in sessionStorage:", sessionAuthKeys);
}

console.log("Logout test script loaded. Check console for results.");
