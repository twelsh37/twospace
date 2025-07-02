// File: frontend/app/layout.tsx
// Root layout for Next.js app. Vercel Analytics is integrated at the bottom of <body> for global page tracking.
// Reasoning: This ensures analytics are loaded on every page, as recommended by Vercel docs.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
// Import the Analytics component from @vercel/analytics
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Management System",
  description: "Comprehensive asset lifecycle management platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          {/* Sidebar flush left */}
          <nav>
            <Sidebar />
          </nav>
          {/* Main Content Area with Header at the top */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main role="main" className="flex-1 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
        {/* Vercel Analytics: Tracks page views and events globally. */}
        <Analytics />
      </body>
    </html>
  );
}
