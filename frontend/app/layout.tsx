import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Management System",
  description: "Comprehensive asset lifecycle management platform",
};

async function getSidebarData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const jsonResponse = await res.json();
    return {
      totalAssets: jsonResponse.data.totalAssets,
      totalUsers: jsonResponse.data.totalUsers,
      totalLocations: jsonResponse.data.totalLocations,
    };
  } catch (error) {
    console.error("Failed to fetch sidebar data:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          {/* Sidebar Navigation */}
          <Sidebar
            totalAssets={sidebarData?.totalAssets}
            totalUsers={sidebarData?.totalUsers}
            totalLocations={sidebarData?.totalLocations}
          />

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-background">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
