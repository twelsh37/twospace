// frontend/app/dashboard/page.tsx
// Main Dashboard Page for Asset Management System

import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AssetsByType } from "@/components/dashboard/assets-by-type";
import { AssetsByState } from "@/components/dashboard/assets-by-state";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
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
        <DashboardStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Assets by Type Chart */}
        <div className="col-span-4">
          <AssetsByType />
        </div>

        {/* Recent Activity */}
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>

      {/* Asset State Overview */}
      <div className="grid gap-4 md:grid-cols-1">
        <AssetsByState />
      </div>
    </div>
  );
}
