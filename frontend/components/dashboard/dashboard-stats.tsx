// frontend/components/dashboard/dashboard-stats.tsx
// Dashboard Statistics Cards Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, ArrowRightCircle } from "lucide-react";

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
  const getCountByState = (state: string) => {
    return assetsByState.find((s) => s.state === state)?.count || 0;
  };

  const availableCount = getCountByState("AVAILABLE");
  const issuedCount = getCountByState("ISSUED");

  const stats: StatCard[] = [
    {
      title: "Total Assets",
      value: totalAssets.toLocaleString(),
      description: "Total assets in the system.",
      icon: Package,
    },
    {
      title: "Available",
      value: availableCount.toLocaleString(),
      description: "Assets in stock, ready to be issued.",
      icon: CheckCircle,
    },
    {
      title: "Issued",
      value: issuedCount.toLocaleString(),
      description: "Assets currently assigned out.",
      icon: ArrowRightCircle,
    },
    {
      title: "Pending Actions",
      value: "N/A",
      description: "Assets needing attention.",
      icon: Clock,
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
