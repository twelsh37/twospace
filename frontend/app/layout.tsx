// File: frontend/app/layout.tsx
// Root Layout with mobile-first responsive design and Supabase Auth

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/lib/auth-context";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Management System",
  description: "Comprehensive asset management and tracking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        {/* Vercel Analytics: Tracks page views and events globally. */}
        <Analytics />
      </body>
    </html>
  );
}

// Reasoning: layout.tsx is now a server component, exporting metadata and using ClientLayout for client-side auth protection.
