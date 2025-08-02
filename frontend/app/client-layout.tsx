// File: frontend/app/client-layout.tsx
// ClientLayout: Handles route-based auth protection for all pages

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
  // Debug page bypass (temporary)
  if (pathname?.startsWith("/debug-auth")) {
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
