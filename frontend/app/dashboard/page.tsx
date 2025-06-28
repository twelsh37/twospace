// frontend/app/dashboard/page.tsx
// Main Dashboard Page for Asset Management System

import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AssetsByType } from "@/components/dashboard/assets-by-type";
import { AssetsByState } from "@/components/dashboard/assets-by-state";
import { QuickActions } from "@/components/dashboard/quick-actions";
import type { DashboardData } from "@/lib/types";
import { getDashboardData } from "@/lib/db/dashboard";

export default async function DashboardPage() {
  // Directly call the shared dashboard data function
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
    // Add horizontal padding for a professional look, while keeping top and bottom padding as set above.
    // Add a subtle light gray background to help cards stand out.
    <div
      className="flex-1 space-y-4 pt-4 md:pt-8 pb-0 px-4 md:px-8 bg-gray-50"
      style={{ marginTop: "-30px" }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-end">
        <QuickActions />
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <DashboardStats
          totalAssets={data.totalAssets}
          assetsByState={data.assetsByState}
        />
      </div>

      {/* Main Content Grid - Two columns: left (stacked), right (full height) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 items-stretch">
        {/* Left Column: Stack Assets by Type and Asset Lifecycle Distribution */}
        <div className="col-span-1 space-y-4 lg:col-span-4 h-full flex flex-col">
          <div className="flex-1">
            <AssetsByType data={data} />
          </div>
          <div className="flex-1">
            <AssetsByState data={data.assetsByState} />
          </div>
        </div>

        {/* Right Column: Recent Activity fills height of both left cards */}
        <div className="col-span-1 lg:col-span-3 h-full flex flex-col">
          <div className="flex-1 h-full">
            <RecentActivity data={data.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
