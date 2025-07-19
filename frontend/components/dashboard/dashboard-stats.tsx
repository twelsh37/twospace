// frontend/components/dashboard/dashboard-stats.tsx
// Dashboard Statistics Cards Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, ArrowRightCircle, Rocket } from "lucide-react";
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
  pendingHoldingCount: number; // Add this prop
};

export function DashboardStats({
  assetsByState,
  pendingHoldingCount,
}: DashboardStatsProps) {
  // const availableCount = getCountByState("AVAILABLE"); // No longer used
  // Helper function to find count by possible state variants
  function getCountByStateVariants(variants: string[]) {
    for (const variant of variants) {
      const found = assetsByState.find((s) => s.state === variant);
      if (found) return found.count;
    }
    return 0;
  }

  // Get count for assets in 'stock' status (Available Stock)
  const availableStockCount = getCountByStateVariants([
    "stock",
    "STOCK",
    "available",
    "AVAILABLE",
  ]);
  // Get count for assets in 'READY_TO_GO' status (handle possible variants)
  const readyToGoStockCount = getCountByStateVariants([
    "READY_TO_GO",
    "ready_to_go",
    "readytogo",
    "ready-to-go",
  ]);
  // Get count for assets in 'active' status (Issued)
  const issuedCountStatus = getCountByStateVariants([
    "active",
    "ACTIVE",
    "issued",
    "ISSUED",
  ]);
  // Get count for assets in 'holding' status (from holding_assets table)
  // const holdingCount = getCountByStateVariants([
  //   "holding",
  //   "HOLDING",
  //   "imported",
  //   "IMPORTED",
  // ]);
  // Use pendingHoldingCount instead
  const holdingCount = pendingHoldingCount;
  // Get count for assets in 'BUILDING' state (handle possible variants)
  const buildingCount = getCountByStateVariants([
    "BUILDING",
    "building",
    "built",
    "BUILT",
  ]);

  const stats: StatCard[] = [
    {
      title: "New Imported Assets",
      value:
        holdingCount > 0 ? holdingCount.toLocaleString() : "No Imported Assets",
      description: "Assets in holding (imported) status.",
      icon: Clock,
    },
    {
      title: "Available Stock",
      value: availableStockCount.toLocaleString(),
      description: "Assets in stock, ready to be issued.",
      icon: CheckCircle,
    },
    {
      title: "Currently Building",
      value: buildingCount.toLocaleString(),
      description: "Assets that are building",
      icon: Rocket,
    },
    {
      title: "Ready To Go",
      value: readyToGoStockCount.toLocaleString(),
      description: "Configured and Ready To Go",
      icon: Rocket,
    },
    {
      title: "Issued",
      value: issuedCountStatus.toLocaleString(),
      description: "Assets currently assigned out.",
      icon: ArrowRightCircle,
    },
  ];

  // Helper to get the correct link for each card
  const getCardLink = (title: string) => {
    switch (title) {
      case "New Imported Assets":
        return "/assets?status=holding&state=all";
      case "Available Stock":
        return "/assets?state=AVAILABLE";
      case "Currently Building":
        return "/assets?state=BUILDING";
      case "Ready To Go":
        return "/assets?state=READY_TO_GO";
      case "Issued":
        return "/assets?state=ISSUED";
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-center w-full">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 pb-1">
              {/* Remove extra margin above the number for tighter vertical spacing */}
              <div className="w-full flex justify-center mt-0 mb-0">
                <div className="text-3xl font-bold m-0 p-0">{stat.value}</div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
}
