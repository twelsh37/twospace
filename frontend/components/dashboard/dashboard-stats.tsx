// frontend/components/dashboard/dashboard-stats.tsx
// Dashboard Statistics Cards Component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, Users } from "lucide-react";

export function DashboardStats() {
  // TODO: Replace with real data from API
  const stats = [
    {
      title: "Total Assets",
      value: "1,234",
      description: "+20.1% from last month",
      icon: Package,
      change: "+20.1%",
      changeType: "positive" as const,
    },
    {
      title: "Available Stock",
      value: "256",
      description: "Ready for assignment",
      icon: CheckCircle,
      change: "+5.2%",
      changeType: "positive" as const,
    },
    {
      title: "Pending Actions",
      value: "42",
      description: "Assets need attention",
      icon: Clock,
      change: "-12.5%",
      changeType: "negative" as const,
    },
    {
      title: "Active Users",
      value: "89",
      description: "Currently assigned",
      icon: Users,
      change: "+2.3%",
      changeType: "positive" as const,
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
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
