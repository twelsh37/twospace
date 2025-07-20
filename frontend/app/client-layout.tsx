// File: frontend/app/client-layout.tsx
// ClientLayout: Handles route-based auth protection for all pages

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  // Standalone login page (no layout, no sidebar, no app chrome)
  if (pathname?.startsWith("/auth/login")) {
    return <>{children}</>;
  }
  // Protect all other routes and show app layout
  return (
    <ProtectedRoute>
      <LayoutWrapper>{children}</LayoutWrapper>
    </ProtectedRoute>
  );
}

// Reasoning: This ensures the login page is rendered standalone, while all other routes are protected and wrapped in the main app layout.
