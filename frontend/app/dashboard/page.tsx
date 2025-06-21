// frontend/app/dashboard/page.tsx
// Main Dashboard Page for Asset Management System

import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AssetsByType } from "@/components/dashboard/assets-by-type";
import { AssetsByState } from "@/components/dashboard/assets-by-state";
import { QuickActions } from "@/components/dashboard/quick-actions";
import type { DashboardData } from "@/lib/types";

// Function to fetch data from the backend API
async function getDashboardData(): Promise<DashboardData | null> {
  try {
    // Add this line to debug the environment variable:
    console.log(
      "Attempting to fetch from API URL:",
      process.env.NEXT_PUBLIC_API_URL
    );

    // We can use a relative path here because of the proxy configured in next.config.ts
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`,
      {
        cache: "no-store", // Ensure we always get the latest data
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch dashboard data:", res.statusText);
      return null;
    }

    const jsonResponse = await res.json();
    return jsonResponse.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Handle case where data fetching fails
  if (!data) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 text-center md:p-8">
        <h2 className="text-2xl font-bold text-red-600">
          Error: Could not load dashboard data.
        </h2>
        <p>Please check the backend server connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <QuickActions />
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats
          totalAssets={data.totalAssets}
          assetsByState={data.assetsByState}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {/* Left Column */}
        <div className="col-span-1 space-y-4 lg:col-span-4">
          <AssetsByType data={data} />
          <AssetsByState data={data.assetsByState} />
        </div>

        {/* Right Column (Recent Activity) */}
        <div className="col-span-1 lg:col-span-3">
          <RecentActivity data={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
