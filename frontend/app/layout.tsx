// File: frontend/app/layout.tsx
// Root Layout with mobile-first responsive design and Supabase Auth

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Management System",
  description: "Comprehensive asset management and tracking system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
        {/* Vercel Analytics: Tracks page views and events globally. */}
        <Analytics />
      </body>
    </html>
  );
}
