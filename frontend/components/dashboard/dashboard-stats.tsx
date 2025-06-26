// frontend/components/dashboard/dashboard-stats.tsx
// Dashboard Statistics Cards Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Clock,
  CheckCircle,
  ArrowRightCircle,
  Rocket,
} from "lucide-react";
import Link from "next/link";

type StatCard = {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
};

type DashboardStatsProps = {
  totalAssets: number;
  assetsByState: { state: string; count: number }[];
};

export function DashboardStats({
  totalAssets,
  assetsByState,
}: DashboardStatsProps) {
  // const availableCount = getCountByState("AVAILABLE"); // No longer used
  // Get count for assets in 'stock' status (Available Stock)
  const availableStockCount =
    assetsByState.find((s) => s.state === "stock")?.count || 0;
  // Get count for assets in 'READY_TO_GO' status (if used as a status)
  const readyToGoStockCount =
    assetsByState.find((s) => s.state === "READY_TO_GO")?.count || 0;
  // Get count for assets in 'active' status (Issued)
  const issuedCountStatus =
    assetsByState.find((s) => s.state === "active")?.count || 0;

  // Get count for assets in 'holding' status
  const holdingCount =
    assetsByState.find((s) => s.state === "holding")?.count || 0;

  const stats: StatCard[] = [
    {
      title: "Total Assets",
      value: totalAssets.toLocaleString(),
      description: "Total assets in the system.",
      icon: Package,
    },
    {
      title: "Available",
      value: availableStockCount.toLocaleString(),
      description: "Assets in stock, ready to be issued.",
      icon: CheckCircle,
    },
    {
      title: "Ready To Go",
      value: readyToGoStockCount.toLocaleString(),
      description: "Ready To Go stock.",
      icon: Rocket,
    },
    {
      title: "Issued",
      value: issuedCountStatus.toLocaleString(),
      description: "Assets currently assigned out.",
      icon: ArrowRightCircle,
    },
    {
      title: "Holding",
      value:
        holdingCount > 0 ? holdingCount.toLocaleString() : "No Imported Assets",
      description: "Assets in holding (imported) status.",
      icon: Clock,
    },
  ];

  // Helper to get the correct link for each card
  const getCardLink = (title: string) => {
    switch (title) {
      case "Available":
        return "/assets?state=AVAILABLE";
      case "Ready To Go":
        return "/assets?state=READY_TO_GO";
      case "Issued":
        return "/assets?state=ISSUED";
      case "Holding":
        return "/assets?status=holding&state=all";
      case "Total Assets":
      default:
        return "/assets";
    }
  };

  return (
    <>
      {stats.map((stat) => (
        <Link
          key={stat.title}
          href={getCardLink(stat.title)}
          style={{ textDecoration: "none" }}
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
}
