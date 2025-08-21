// mobile/src/app/_layout.tsx
// Root layout for Expo Router

import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/screens/LoadingScreen";

export default function RootLayout() {
  const { authState } = useAuth();

  // Show loading screen while checking authentication
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      {authState.isAuthenticated ? (
        // Authenticated user - show main app
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="asset/[id]"
            options={{ title: "Asset Details" }}
          />
          <Stack.Screen
            name="asset/[id]/edit"
            options={{ title: "Edit Asset" }}
          />
          <Stack.Screen name="user/[id]" options={{ title: "User Details" }} />
        </>
      ) : (
        // Not authenticated - show auth screens
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
} 