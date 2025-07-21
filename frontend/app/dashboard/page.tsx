// frontend/app/dashboard/page.tsx
// Main Dashboard Page for Asset Management System

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

import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AssetsByType } from "@/components/dashboard/assets-by-type";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  BuildingAssetsCard,
  ReadyToGoAssetsCard,
} from "@/components/dashboard/building-assets-card";
import { getDashboardData } from "@/lib/db/dashboard";
import { Card } from "@/components/ui/card";

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
    // Mobile-first responsive dashboard layout
    <Card className="m-2 md:m-4 p-0 bg-white shadow-lg">
      <div className="flex-1 space-y-4 pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-center md:justify-end">
          <QuickActions />
        </div>

        {/* Dashboard Stats Grid - Mobile stacked, desktop grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <DashboardStats
            totalAssets={data.totalAssets}
            assetsByState={data.assetsByState}
            pendingHoldingCount={data.pendingHoldingCount}
          />
        </div>

        {/* Main Content Grid - Mobile stacked, desktop two columns */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:items-end items-stretch">
          {/* Left Column: Stack Assets by Type and Building Assets */}
          <div className="col-span-1 space-y-4 lg:col-span-4 h-full flex flex-col">
            <div className="flex-1">
              <AssetsByType data={data} />
            </div>
            <div className="flex-1">
              {/* SSR: Pass buildingByType from server data */}
              <BuildingAssetsCard buildingByType={data.buildingByType} />
            </div>
            <div className="flex-1">
              {/* SSR: Pass readyToGoByType from server data */}
              <ReadyToGoAssetsCard readyToGoByType={data.readyToGoByType} />
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
    </Card>
  );
}
